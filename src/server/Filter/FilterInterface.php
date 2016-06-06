<?php

namespace Dime\Server\Filter;

interface FilterInterface
{
    public function name();
    
    public function __invoke($value);
}
