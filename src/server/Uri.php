<?php

namespace Dime\Server;

use Psr\Http\Message\ServerRequestInterface;
use Slim\Interfaces\RouterInterface;
use Slim\Http\Environment;

class Uri
{

    private $router;
    private $env;

    public function __construct(RouterInterface $router, Environment $env)
    {
        $this->router = $router;
        $this->env = $env;
    }

    public function pathFor($name, array $data = [], array $queryParams = [])
    {
        return $this->env['CONTEXT_PREFIX'] . $this->router->pathFor($name, $data, $queryParams);
    }

    public function hasQueryParam(ServerRequestInterface $request, $name)
    {
        $parameters = $request->getQueryParams();
        return !empty($parameters) && isset($parameters[$name]);
    }

    public function getQueryParam(ServerRequestInterface $request, $name, $default = null)
    {
        $result = $default;
        if ($this->hasQueryParam($request, $name)) {
            $parameters = $request->getQueryParams();
            $result = $parameters[$name];
        }
        return $result;
    }

    public function buildLinkHeader(ServerRequestInterface $request, $total, $page, $with)
    {
        $args = $request->getAttribute('routeInfo')[2];

        $lastPage = 1;
        $queryParameter = $request->getQueryParams();
        if ($with > 1) {
            $lastPage = ceil($total / $with);
            $queryParameter['with'] = $with;
        }

        $link = [];
        if ($page + 1 <= $lastPage) {
            $queryParameter['page'] =  $page + 1;
            $link[] = sprintf('<%s>; rel="next"', $this->pathFor(
                'resource_list',
                $args,
                $queryParameter
            ));
        }
        if ($page - 1 > 0) {
            $queryParameter['page'] =  $page - 1;
            $link[] = sprintf('<%s>; rel="prev"', $this->pathFor(
                'resource_list',
                $args,
                $queryParameter
            ));
        }
        if ($page != 1) {
            $queryParameter['page'] =  1;
            $link[] = sprintf('<%s>; rel="first"', $this->pathFor(
                'resource_list',
                $args,
                $queryParameter
            ));
        }
        if ($page != $lastPage) {
            $queryParameter['page'] =  $lastPage;
            $link[] = sprintf('<%s>; rel="last"', $this->pathFor(
                'resource_list',
                $args,
                $queryParameter
            ));
        }

        return $link;
    }

}
