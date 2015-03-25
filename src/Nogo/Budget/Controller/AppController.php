<?php
namespace Nogo\Budget\Controller;

use Nogo\Framework\Controller\SlimController;
use Nogo\Framework\Middleware\Route;
use Nogo\Framework\Middleware\Auth\Digest;
use Slim\Slim;

class AppController implements SlimController
{
    /**
     * @var Slim
     */
    protected $app;
    
    public function enable(Slim $app)
    {
        $this->app = $app;

        // Default route
        $this->app->get('/', [$this, 'indexAction']);
        
        // Add AuthDigest to /api route
        $auth = $this->app->config('auth');
        if (!empty($auth)) {
            $api = $this->app->config('api');
            $this->app->add(new Route($api['prefix'], new Digest($auth['credentials'], $auth['realm'])));
        }
    }

    public function indexAction()
    {
        $view = $this->app->view();
        $view->setTemplatesDirectory(dirname(__FILE__) . '/../Resources/public');
        $view->display('index.html');
    }
}
