<?php

namespace Dime\Server\Functionial;

function positive($value)
{
    return is_numeric($value) && $value > 0 || substr($value, 0, 1) !== '-';
}

function negative($value)
{
    return is_numeric($value) && $value < 0 || preg_match('/[-].*/', $value) === 1;
}

function abs($value)
{
    $matches = [];
    if (is_numeric($value)) {
        return \abs($value);
    } else if (preg_match('/[-](.*)/', $value, $matches) === 1) {
        return $matches[1];
    }
    return $value;
}
