<?php

namespace Dime\Server\Scope;

use DateTime;
use Doctrine\DBAL\Query\QueryBuilder;

class DateScope
{
    private $start;
    private $end;
    private $map;

    private $format = 'Y-m-d H:i:s';

    public function __construct(DateTime $start, DateTime $end = null, array $map = ['start' => 'updated_at', 'end' => 'updated_at'])
    {
        $this->start = $start;
        $this->end = $end;
        $this->map = $map;
    }

    public function __invoke(QueryBuilder $qb)
    {
        if (!empty($this->start)) {
            $qb->andWhere($qb->expr()->gte($this->map['start'], ':start'))->setParameter('start', $this->start->format($this->format));
        }

        if (!empty($this->end)) {
            $qb->andWhere($qb->expr()->lte($this->map['end'], ':end'))->setParameter('end', $this->end->format($this->format));
        }

        return $qb;
    }
}
