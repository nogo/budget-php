<?php
namespace Nogo\Budget\Controller;

use Nogo\Framework\Controller\SlimController;
use Nogo\Framework\Database\Migrate;
use Slim\Slim;

class MaintenanceController implements SlimController
{
    protected $app;

    public function enable(Slim $app)
    {
        $this->app = $app;

        //$this->app->get('/install', [$this, 'installAction']); // TODO
        $this->app->get('/update', [$this, 'updateAction']);
    }

    public function updateAction()
    {
        $queries = Migrate::run(
                $this->app->connection->getPdo(),
                $this->app->config('migration_dir') . '/' . $this->app->config('database.adapter')
        );

        $this->app->response()->status(200);
        $this->app->response()->body(join('<br>', $queries));
    }
}
