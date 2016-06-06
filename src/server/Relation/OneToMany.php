<?php

namespace Dime\Server\Relation;

use Dime\Server\Repository;

class OneToMany
{
    private $repository;
    private $foreignKey;
    private $foreignName;
    private $identifier;

    public function __construct(Repository $repository, $foreignKey, $foreignName, $identifier = 'id')
    {
        $this->repository = $repository;
        $this->foreignKey = $foreignKey;
        $this->foreignName = $foreignName;
        $this->identifier = $identifier;
    }

    public function __invoke($data)
    {
        if (!empty($data) && isset($data[$this->identifier])) {
            $data[$this->foreignName] = $this->repository->findAll([
                new \Dime\Server\Scope\WithScope([
                    $this->foreignKey => $data[$this->identifier]
                ])
            ]);
        }

        return $data;
    }
}
