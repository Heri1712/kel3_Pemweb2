import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * 
 * A custom hook that uses IntersectionObserver to add a CSS class
 * when an element enters the viewport, triggering scroll-reveal animations.
 *
 * @param {object} options
 * @param {number} options.threshold - Percentage of element visible before triggering (0–1)
 * @param {string} options.rootMargin - Margin around root for early/late trigger
 * @param {boolean} options.once - If true, animation only plays once
 * @returns {React.RefObject} ref - Attach this ref to the element you want to animate
 */
export function useScrollReveal({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * useScrollRevealGroup
 *
 * Like useScrollReveal but for a list of children inside a container.
 * Adds 'revealed' to each child with a staggered delay using --reveal-delay CSS variable.
 *
 * @param {object} options
 * @param {string} options.childSelector - CSS selector to find children
 * @param {number} options.threshold
 * @param {string} options.rootMargin
 * @param {boolean} options.once
 * @returns {React.RefObject} ref - Attach to the parent container
 */
export function useScrollRevealGroup({
  childSelector = '[data-reveal]',
  threshold = 0.05,
  rootMargin = '0px 0px -20px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.querySelectorAll(childSelector));
    if (children.length === 0) return;

    const observers = children.map((child, i) => {
      child.style.setProperty('--reveal-delay', `${i * 80}ms`);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              if (once) observer.unobserve(entry.target);
            } else if (!once) {
              entry.target.classList.remove('revealed');
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(child);
      return observer;
    });

    return () => {
      children.forEach((child, i) => {
        if (child) observers[i]?.unobserve(child);
      });
    };
  }, [childSelector, threshold, rootMargin, once]);

  return ref;
}
