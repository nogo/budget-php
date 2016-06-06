<?php

namespace Dime\Server;

use Dime\Server\Metadata;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;

class Repository
{

    private $connection;
    private $metadata;
    private $table;

    /**
     * Constructor.
     * @param Connection $connection Database connection
     * @param string $table Name of the table.
     */
    public function __construct(Connection $connection, $table = null)
    {
        $this->connection = $connection;

        if ($this->connection != null) {
            $this->metadata = new Metadata($this->connection->getSchemaManager());
        }

        if (!empty($table)) {
            $this->table = $table;
        }
    }

    /**
     * The database connection.
     * @return Connection
     */
    public function getConnection()
    {
        return $this->connection;
    }

    /**
     * Get table metadata.
     * @return Metadata
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /**
     * The alias are the first three letters of tablename. Example user -> use
     * @return string
     */
    public function getAlias()
    {
        return substr($this->table, 0, 3);
    }

    /**
     * @return string name of resource
     */
    public function getName()
    {
        return $this->table;
    }

    /**
     * Resource name.
     * @param string $name
     */
    public function setName($name)
    {
        $this->table = $name;
        
        return $this;
    }

    /**
     * Find one entity.
     * @param array $scopes array with callables getting QueryBuilder as parameter.
     * @return array
     */
    public function find(array $scopes = [])
    {
        return $this->scopedQuery($scopes)->execute()->fetch();
    }

    /**
     * Find all entities.
     * @param array $scopes array with callables getting QueryBuilder as parameter.
     * @return array
     */
    public function findAll(array $scopes = [])
    {
        return $this->scopedQuery($scopes)->execute()->fetchAll();
    }

    /**
     * Insert entity.
     * @param array $data
     * @return int id of the last inserted.
     */
    public function insert(array $data)
    {
        try {
            $this->getConnection()->insert(
                $this->getName(),
                $this->getMetadata()->filter($this->getName(), $data)->collect()
            );
        } catch (\Exception $e) {
            throw new \Exception('No data', $e->getCode(), $e);
        }

        return $this->getConnection()->lastInsertId();
    }

    /**
     * Update entity.
     * @param array $data
     * @param array $identifier
     * @return int amount of affected rows
     */
    public function update(array $data, array $identifier)
    {
        return $this->getConnection()->update(
            $this->getName(),
            $this->getMetadata()->filter($this->getName(), $data)->collect(),
            $identifier
        );
    }

    /**
     * Delete entity.
     * @param array $identifier
     * @return int amount of affected rows
     */
    public function delete(array $identifier)
    {
        return $this->connection->delete($this->getName(), $identifier);
    }

    /**
     * Count all entities.
     * @return int
     */
    public function count(array $scopes = [])
    {
        return $this->scopedQuery($scopes)->select('count(*)')->execute()->fetchColumn();
    }

    /**
     * Create a scope query builder.
     *
     * @param array $scopes
     * @param QueryBuilder $qb
     * @return QueryBuilder
     */
    protected function scopedQuery(array $scopes = [], QueryBuilder $qb = null)
    {
        if ($qb == null) {
            $qb = $this
                ->getConnection()
                ->createQueryBuilder()
                ->from($this->getName(), $this->getAlias())
                ->select('*');
        }

        foreach ($scopes as $action) {
            $qb = call_user_func($action, $qb);
        }

        return $qb;
    }
}
