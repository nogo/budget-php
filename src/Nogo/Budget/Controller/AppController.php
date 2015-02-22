<?php
namespace Nogo\Budget\Controller;

use Nogo\Framework\Controller\Controller;
use Slim\Slim;

class AppController implements Controller
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
        $view->setTemplatesDirectory(dirname(__FILE__) . '/../Resources/views');
        $view->display('index.html');
    }
}
