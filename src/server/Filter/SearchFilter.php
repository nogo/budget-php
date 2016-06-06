<?php

namespace Dime\Server\Filter;

use Dime\Server\Scope\SearchScope;

class SearchFilter implements FilterInterface
{
    const NAME = 'search';

    private $map;

    public function __construct(array $map = ['description'])
    {
        $this->map = $map;
    }

    public function name()
    {
        return self::NAME;
    }

    public function __invoke($value)
    {
        $value = preg_replace('/\*+/', '%', filter_var($value, FILTER_SANITIZE_STRING));
        return new SearchScope($value, $this->map);
    }
}
