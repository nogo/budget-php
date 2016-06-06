<?php

namespace Dime\Server\Filter;

use Dime\Server\Scope\WithScope;

class RelationFilter implements FilterInterface
{
    private $name;
    private $mappedTo;

    public function __construct($name, $mappedTo = null)
    {
        $this->name = $name;

        if (empty($mappedTo)) {
            $this->mappedTo = $this->name . '_id';
        }
    }

    public function name()
    {
        return $this->name;
    }

    public function __invoke($value)
    {
        $value = explode(';', filter_var($value, FILTER_SANITIZE_STRING));
        if (count($value) === 1) {
            $value = $value[0];
        }

        return new WithScope([ $this->mappedTo => $value ]);
    }
}
