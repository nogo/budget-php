<?php

namespace Dime\Server\Validator;

class Required
{
    private $names;
    private $message;

    public function __construct(array $names, $message = 'The field [%s] is required.')
    {
        $this->names = $names;
        $this->message = $message;
    }

    public function __invoke($data)
    {
        $errors = [];
        foreach ($this->names as $name) {
            if (!isset($data[$name])) {
                $errors[$name] = sprintf($this->message, $name);
            }
        }
        return $errors;
    }
}
