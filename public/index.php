<?php

use Nogo\Framework\Controller\Controller;
use Nogo\Framework\Config\Loader as Config;
use Slim\Slim;

define('ROOT_DIR', realpath(dirname(__FILE__) . '/../' ));

require_once ROOT_DIR . '/vendor/autoload.php';

$app = new Slim();

// start framework configuration
$app->container->singleton('configuration', function() use ($app) {
    return new Config($app);
});
$app->configuration->import(ROOT_DIR . '/app/config.yml')->refresh();

// load controller
foreach($app->config('routes') as $class) {
    $ref = new ReflectionClass($class);
    if ($ref->implementsInterface('Nogo\Framework\Controller\Controller')) {
        /**
         * @var Controller $controller
         */
        $controller = new $class();
        $controller->enable($app);
        $app->log->info('Register and enable controller [' . $class . '].');
    }
}

$app->run();