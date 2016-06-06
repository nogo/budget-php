<?php

namespace Dime\Server\Relation;

use Dime\Server\Repository;
use Dime\Server\Stream;

class OneToManyFlatten
{
    private $repository;
    private $foreignKey;
    private $foreignName;
    private $flattenName;
    private $identifier;

    public function __construct(Repository $repository, $foreignKey, $foreignName, $flattenName, $identifier = 'id')
    {
        $this->repository = $repository;
        $this->foreignKey = $foreignKey;
        $this->foreignName = $foreignName;
        $this->flattenName = $flattenName;
        $this->identifier = $identifier;
    }

    public function __invoke($data)
    {
        if (!empty($data) && isset($data[$this->identifier])) {
            $data[$this->foreignName] = Stream::of($this->repository->findAll([
                new \Dime\Server\Scope\WithScope([
                    $this->foreignKey => $data[$this->identifier]
                ])
            ]))->map([$this, 'flatten'])->collect();
        }

        return $data;
    }

    public function flatten(array $relation)
    {
        return $relation[$this->flattenName];
    }
}
