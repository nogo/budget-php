<?php

define('ROOT_DIR', realpath(dirname(__FILE__) . '/../' ));
require_once ROOT_DIR . '/vendor/autoload.php';

$bootstrap = new \Nogo\Framework\Bootstrap(new Slim\Slim());
$bootstrap
        ->configure(ROOT_DIR . '/app/config.yml')
        ->log()
        ->route()
        ->run();
