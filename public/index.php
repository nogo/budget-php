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

// load controller
foreach($app->config('routes') as $class) {
    $ref = new ReflectionClass($class);
    if ($ref->implementsInterface('Nogo\Framework\Controller\SlimController')) {
        /**
         * @var Controller $controller
         */
        $controller = new $class();
        $controller->enable($app);
        $app->log->info('Register and enable controller [' . $class . '].');
    }
}

$app->run();