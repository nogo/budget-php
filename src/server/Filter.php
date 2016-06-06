<?php

namespace Dime\Server;

class Filter
{
    private $allowed = [];

    public function __construct(array $allowed = [])
    {
        $this->allowed = $allowed;
    }

    public function build(array $data)
    {
        $result = [];
        foreach ($this->allowed as $filter) {
            $name = $filter->name();
            if (isset($data[$name])) {
                $result[] = $filter($data[$name]);
            }
        }
        return $result;
    }

    public function __invoke(array $data)
    {
        return $this->build($data);
    }
}
