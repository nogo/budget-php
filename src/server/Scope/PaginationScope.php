<?php

namespace Dime\Server\Scope;

use Doctrine\DBAL\Query\QueryBuilder;

class PaginationScope
{
    private $page = 1;
    private $with = -1;

    public function __construct($page = 1, $with = -1)
    {
        $this->page = intval($page);
        $this->with = intval($with);
    }

    public function __invoke(QueryBuilder $qb)
    {
        $qb->setFirstResult($this->with * ($this->page - 1));
        if ($this->with > 0) {
            $qb->setMaxResults($this->with);
        }

        return $qb;
    }
}
