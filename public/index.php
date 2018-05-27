<?php

define('ROOT_DIR', realpath(dirname(__FILE__) . '/../'));

// Composer autoloading

if (!file_exists(ROOT_DIR . '/vendor/autoload.php')) {
    die('Please do \'composer install\'!');
}
require_once ROOT_DIR . '/vendor/autoload.php';

use Interop\Container\ContainerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\NotFoundException;

// Configuration

$configuration = [];
if (file_exists(ROOT_DIR . '/config/parameters.php')) {
    $configuration = require_once ROOT_DIR . '/config/parameters.php';
} else {
    die('Please, create copy "parameters.php.dist" to "parameters.php" in config folder!');
}
$settings = array_replace_recursive(
    [
        'displayErrorDetails' => true,
        'enableSecurity' => false,
        'allowedResources' => [
            'budget', 'categories', 'review_monthly', 'review_category_monthly'
        ]
    ],
    $configuration
);

// DI Container

$container = new \Slim\Container(['settings' => $settings]);

// Dependencies

$container['connection'] = function (ContainerInterface $container) {
    $connection = \Doctrine\DBAL\DriverManager::getConnection($container['settings']['database'], new \Doctrine\DBAL\Configuration());

    $platform = $connection->getDatabasePlatform();
    $platform->registerDoctrineTypeMapping('enum', 'string');
    return $connection;
};

$container['metadata'] = function (ContainerInterface $container) {
    return new \Dime\Server\Metadata($container->get('connection')->getSchemaManager());
};

$container['repository'] = function (ContainerInterface $container) {
    return new \Dime\Server\Repository($container->get('connection'));
};

$container['session'] = function () {
    return new \Dime\Server\Session();
};

$container['responder'] = function () {
    return new \Dime\Server\Responder\JsonResponder();
};

$container['uri'] = function (ContainerInterface $container) {
    return new \Dime\Server\Uri($container->get('router'), $container->get('environment'));
};

$container['security'] = function () {
    return new \Dime\Api\SecurityProvider();
};

// Middleware

$container['Dime\Server\Middleware\Authorization'] = function (ContainerInterface $container) {
    if (!$container->get('settings')['enableSecurity']) {
        return new \Dime\Server\Middleware\Pass();
    }

    $auth = $container->get('settings')['auth'];

    return new \Dime\Server\Middleware\AuthDigest(
        $container->get('responder'),
        $auth['realm'],
        $auth['users']
    );
};

$container['Dime\Server\Middleware\ResourceType'] = function (ContainerInterface $container) {
    return new \Dime\Server\Middleware\ResourceType($container->get('settings')['allowedResources']);
};

// Repositories

$container['budget_filter'] = function () {
    return new \Dime\Server\Filter([
        new \Dime\Server\Filter\DateFilter()
    ]);
};

// App

$app = new \Slim\App($container);

$app->get('/', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
    $response->getBody()->write(file_get_contents('index.html'));
    return $response;
});

$app->get('/apidoc[/{resource}]', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
    $metadata = $this->get('metadata');

    if (array_key_exists('resource', $args)) {
        if (!$metadata->hasResource($args['resource'])) {
            throw new NotFoundException($request, $response);
        }

        $result = \Dime\Server\Stream::of($metadata->resource($args['resource'])->getColumns())->map(function ($value, $key) {
            return $value->getType()->getName();
        })->collect();
    } else {
        if (empty($this->get('settings')['allowedResources'])) {
            $result = $metadata->resources();
        } else {
            $result = $this->get('settings')['allowedResources'];
        }
    }

    return $this->get('responder')->respond($response, $result);
})->add('Dime\Server\Middleware\Authorization')
  ->add('Dime\Server\Middleware\ResourceType');

// API routes

$app->group('/api', function () {

    $this->get('/{resource}/{id:\d+}', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
        $repository = $this->get('repository')->setName($args['resource']);
        $identifier = [
            'id' => $args['id']
        ];

        // Select
        $result = $repository->find([
            new \Dime\Server\Scope\WithScope($identifier),
        ]);

        if ($result === FALSE) {
            throw new NotFoundException($request, $response);
        }

        return $this->get('responder')->respond($response, $result);
    });

    $this->get('/{resource}', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
        $repository = $this->get('repository')->setName($args['resource']);
        $by = $this->get('uri')->getQueryParam($request, 'by', []);

        $filter = [];
        if ($this->has($args['resource'] . '_filter')) {
            $filter = $this->get($args['resource'] . '_filter')->build($by);
        }

        try {
            $result = $repository->findAll($filter);
        } catch (\Exception $ex) {
            throw new NotFoundException($request, $response);
        }

        return $this->get('responder')->respond($response, $result);
    });

    $this->post('/{resource}', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
        $repository = $this->get('repository')->setName($args['resource']);

        $parsedData = $request->getParsedBody();
        if (empty($parsedData)) {
            throw new \Exception("No data");
        }

        // Validate
        if ($this->has($args['resource'] . '_validator')) {
            $errors = $this->get($args['resource'] . '_validator')->validate($parsedData);
            if (!empty($errors)) {
                return $this->get('responder')->respond($response, $errors, 400);
            }
        }

        try {
            $id = $repository->insert($parsedData);
        } catch (\Exception $e) {
            throw new \Exception("No data");
        }

        $identity = [
            'id' => $id
        ];

        $result = $repository->find([
            new \Dime\Server\Scope\WithScope($identity)
        ]);

        return $this->get('responder')->respond($response, $result);

    })->setName('resource_list');

    $this->put('/{resource}/{id:\d+}', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
        $repository = $this->get('repository')->setName($args['resource']);
        $identifier = [
            'id' => $args['id']
        ];

        $result = $repository->find([
            new \Dime\Server\Scope\WithScope($identifier)
        ]);
        if ($result === FALSE) {
            throw new NotFoundException($request, $response);
        }

        $parsedData = $request->getParsedBody();
        if (empty($parsedData)) {
            throw new \Exception("No data");
        }

        // Validate
        if ($this->has($args['resource'] . '_validator')) {
            $errors = $this->get($args['resource'] . '_validator')->validate($parsedData);
            if (!empty($errors)) {
                return $this->get('responder')->respond($response, $errors, 400);
            }
        }

        try {
            $repository->update($parsedData, $identifier);
        } catch (\Exception $e) {
            var_dump($e);
        }

        $result = $repository->find([
            new \Dime\Server\Scope\WithScope($identifier)
        ]);

        return $this->get('responder')->respond($response, $result);

    });

    $this->delete('/{resource}/{id:\d+}', function (ServerRequestInterface $request, ResponseInterface $response, array $args) {
        $repository = $this->get('repository')->setName($args['resource']);
        $identifier = [
            'id' => $args['id']
        ];

        // Select
        $result = $repository->find([
            new \Dime\Server\Scope\WithScope($identifier)
        ]);
        if ($result === FALSE) {
            throw new NotFoundException($request, $response);
        }

        // Delete
        $repository->delete($identifier);

        return $this->get('responder')->respond($response, $result);
    });

})->add('Dime\Server\Middleware\Authorization')
  ->add('Dime\Server\Middleware\ResourceType');


$app->run();
