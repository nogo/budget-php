<?php

namespace Dime\Server\Middleware;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\NotFoundException;

class ResourceType
{

    private $resources;

    public function __construct(array $resources)
    {
        $this->resources = $resources;
    }

    public function __invoke(ServerRequestInterface $request, ResponseInterface $response, callable $next)
    {
        $resource = $request->getAttribute('route')->getArgument('resource');

        if (!empty($this->resources) && !empty($resource) && !in_array($resource, $this->resources, true)) {
            throw new NotFoundException($request, $response);
        }

        return $next($request, $response);
    }

}
