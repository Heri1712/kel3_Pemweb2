<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Mini Retail</title>
</head>
<body>
    <!-- Logo Mini Retail -->
    <div>
        <strong>MINI RETAIL</strong>
    </div>

    <hr>

    <!-- Form Login -->
    <div>
        <h1>LOGIN</h1>
        <h3>SELAMAT DATANG KEMBALI!</h3>

        <!-- Flash Message dari Session -->
        <?php if (session()->getFlashdata('error')): ?>
            <div style="color: red;">
                <?= session()->getFlashdata('error') ?>
            </div>
        <?php endif; ?>

        <!-- Container Response API -->
        <div id="error-container" style="color: red; display: none;"></div>
        <div id="success-container" style="color: green; display: none;"></div>

        <form id="login-form">
            <div>
                <label for="email">Email</label><br>
                <input type="email" id="email" name="email" placeholder="Masukan Email" required>
            </div>
            <br>
            <div>
                <label for="password">Password</label><br>
                <input type="password" id="password" name="password" placeholder="Masukan Password" required>
            </div>
            <br>
            <button type="submit" id="btn-submit">Login</button>
        </form>

        <p>Belum punya akun? <a href="<?= base_url('register') ?>">Daftar</a></p>
    </div>

    <script>
        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorContainer = document.getElementById('error-container');
            const successContainer = document.getElementById('success-container');
            const btnSubmit = document.getElementById('btn-submit');

            // Reset messages
            errorContainer.style.display = 'none';
            errorContainer.innerHTML = '';
            successContainer.style.display = 'none';
            successContainer.innerHTML = '';
            btnSubmit.disabled = true;
            btnSubmit.innerText = 'Memproses...';

            try {
                const response = await fetch('<?= base_url("api/login") ?>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    successContainer.innerText = result.messages.success;
                    successContainer.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '<?= base_url("dashboard") ?>';
                    }, 1000);
                } else {
                    errorContainer.style.display = 'block';
                    if (result.messages && typeof result.messages === 'object') {
                        let errorHtml = '<ul>';
                        for (const field in result.messages) {
                            errorHtml += `<li>${result.messages[field]}</li>`;
                        }
                        errorHtml += '</ul>';
                        errorContainer.innerHTML = errorHtml;
                    } else if (result.messages) {
                        errorContainer.innerText = result.messages;
                    } else {
                        errorContainer.innerText = 'Terjadi kesalahan saat login.';
                    }
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = 'Login';
                }
            } catch (error) {
                console.error('Error:', error);
                errorContainer.innerText = 'Gagal terhubung ke server.';
                errorContainer.style.display = 'block';
                btnSubmit.disabled = false;
                btnSubmit.innerText = 'Login';
            }
        });
    </script>
</body>
</html>
