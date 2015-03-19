<?php
namespace Nogo\Budget\Controller;

use Nogo\Framework\Controller\SlimController;
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

        $this->app->get('/', [$this, 'indexAction']);
    }

    public function indexAction()
    {
        $view = $this->app->view();
        $view->setTemplatesDirectory(dirname(__FILE__) . '/../Resources/public');
        $view->display('index.html');
    }
}
