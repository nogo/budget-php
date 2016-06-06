<?php

namespace Dime\Server\Scope;

use Doctrine\DBAL\Query\QueryBuilder;

class OrderByScope
{

    private $order;

    public function __construct(array $order = [ 'id' => 'ASC'])
    {
        $this->order = $order;
    }

    public function __invoke(QueryBuilder $qb)
    {
        if (empty($this->order)) {
            return $qb;
        }

        foreach ($this->order as $sort => $sortOrder) {
            $qb = $qb->addOrderBy($sort, $sortOrder);
        }

        return $qb;
    }

}
