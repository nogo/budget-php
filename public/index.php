<?php

define('ROOT_DIR', realpath(dirname(__FILE__) . '/../' ));
require_once ROOT_DIR . '/vendor/autoload.php';

use Nogo\Framework\Config\SlimLoader;
use Slim\Slim;

$app = new Slim();

// start framework configuration
$app->container->singleton('configuration', function() use ($app) {
    return new SlimLoader($app);
});
$app->configuration->import(ROOT_DIR . '/app/config.yml')->refresh();

$app->config(
    'log.writer', new Nogo\Framework\Log\Writer(array('path' => $app->config('log_dir')))
);

// load controller
foreach($app->config('routes') as $class) {
    $ref = new ReflectionClass($class);
    if ($ref->implementsInterface('Nogo\Framework\Controller\SlimController')) {
        /**
         * @var Controller $controller
         */
        $controller = new $class();
        $controller->enable($app);
        $app->log->debug('Register and enable controller [' . $class . '].');
    }
}

$app->run();
