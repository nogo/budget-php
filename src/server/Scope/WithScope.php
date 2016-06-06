<?php

namespace Dime\Server\Scope;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;


class WithScope
{
    private $identifier;

    public function __construct(array $identifier = [])
    {
        $this->identifier = $identifier;
    }

    public function __invoke(QueryBuilder $qb)
    {
        foreach ($this->identifier as $key => $value) {
            if (empty($value)) {
                continue;
            }

            if (is_array($value) && count($value) === 1) {
                $value = current($value);
            }

            if (is_array($value)) {
                $this->in($qb, $key, $value);
            } else {
                $this->equal($qb, $key, $value);
            }
        }
        return $qb;
    }

    public function equal(QueryBuilder $qb, $key, $value)
    {
        if (\Dime\Server\Functionial\negative($value)) {
            $qb = $qb->andWhere(
                $qb->expr()->neq($key, ':' . $key . '_neq')
            )->setParameter($key . '_neq', \Dime\Server\Functionial\abs($value));
        } else {
            $qb = $qb->andWhere(
                $qb->expr()->eq($key, ':' . $key)
            )->setParameter($key, $value);
        }
    }

    public function in(QueryBuilder $qb, $key, array $value)
    {
        $positive_array = array_filter($value, '\Dime\Server\Functionial\positive');
        if (!empty($positive_array)) {
            $qb
                ->andWhere($key . ' IN (:' . $key . '_plist)')
                ->setParameter($key . '_plist', $positive_array, Connection::PARAM_INT_ARRAY);
        }

        $negative_array = array_filter($value, '\Dime\Server\Functionial\negative');
        if (!empty($negative_array)) {
            $qb
                ->andWhere($key . ' NOT IN (:' . $key . '_nlist)')
                ->setParameter($key . '_nlist', array_map('\Dime\Server\Functionial\abs', $negative_array), Connection::PARAM_INT_ARRAY);
        }
    }
}
