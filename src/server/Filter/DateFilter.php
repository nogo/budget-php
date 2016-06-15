<?php

namespace Dime\Server\Filter;

use DateTime;
use Dime\Server\Scope\DateScope;

class DateFilter implements FilterInterface
{
    const NAME = 'date';

    public function name()
    {
        return self::NAME;
    }

    public function __invoke($value)
    {
        if (preg_match('/\d{4}-\d{2}/', $value) === FALSE) {
          return;
        }

        // Create start date
        $start = DateTime::createFromFormat('Y-m', $value)->modify('first day of')->modify('today');

        // Create end date
        $end = clone $start;
        $end->modify('last day of')->setTime(23, 59, 59);

        return new DateScope($start, $end, ['start' => 'date', 'end' => 'date']);
    }
}
