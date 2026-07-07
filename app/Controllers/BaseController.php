<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Validation\ValidationInterface;
use Psr\Log\LoggerInterface;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var list<string>
     */
    protected $helpers = ['jwt'];

    /**
     * Validator instance, dipakai oleh validateInput().
     *
     * @var ValidationInterface
     */
    protected $validator;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);
    }

    /**
     * Mengambil data input dari request, mendukung:
     * - application/json (raw JSON body)
     * - multipart/form-data (form-data, termasuk upload file)
     * - application/x-www-form-urlencoded
     *
     * @return mixed
     */
    protected function input(?string $key = null)
    {
        $contentType = $this->request->getHeaderLine('Content-Type');

        if (stripos($contentType, 'application/json') !== false) {
            $data = $this->request->getJSON(true) ?? [];
        } elseif (stripos($contentType, 'multipart/form-data') !== false) {
            $data = $this->request->getPost();
        } else {
            $data = $this->request->getRawInput();
        }

        if (! is_array($data)) {
            $data = [];
        }

        if ($key !== null) {
            return $data[$key] ?? null;
        }

        return $data;
    }

    /**
     * Validasi array data menggunakan rules CodeIgniter,
     * tidak bergantung pada $request->getVar() (agar konsisten untuk JSON body).
     */
    protected function validateInput(array $rules, array $data): bool
    {
        $this->validator = \Config\Services::validation();
        $this->validator->setRules($rules);

        return $this->validator->run($data);
    }
}
