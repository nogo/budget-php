<?php

namespace Dime\Server\Scope;

use Doctrine\DBAL\Query\QueryBuilder;

class SearchScope
{
    private $text;
    private $map;

    public function __construct($text, array $map = ['description'])
    {
        $this->text = $text;
        $this->map = $map;
    }

    public function __invoke(QueryBuilder $qb)
    {
        foreach ($this->map as $key) {
            $qb->andWhere(
                $qb->expr()->like('LOWER(' . $key . ')', ':' . $key . '_like')
            )->setParameter($key . '_like', $this->text);
        }
        return $qb;
    }
}
