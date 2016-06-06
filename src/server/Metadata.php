<?php

namespace Dime\Server;

use Dime\Server\Stream;
use Doctrine\DBAL\Schema\AbstractSchemaManager;

class Metadata
{

    private $schemaManager;

    public function __construct(AbstractSchemaManager $schemaManager)
    {
        $this->schemaManager = $schemaManager;
    }

    /**
     * List of all table resources.
     * @return array
     */
    public function resources()
    {
        return $this->schemaManager->listTableNames();
    }

    /**
     * Resource table definition.
     * @param string $name
     * @return \Doctrine\DBAL\Schema\Table
     */
    public function resource($name)
    {
        return $this->schemaManager->listTableDetails($name);
    }

    /**
     * Check if the resource table exists.
     * @param string $name
     * @return boolean
     */
    public function hasResource($name)
    {
        return $this->schemaManager->tablesExist($name);
    }
      
    /**
     * Iterate thrue data array and filter non existing columns.
     * 
     * @param string $name resource name.
     * @param array $data
     * @return Stream
     */
    public function filter($name, array $data)
    {
        $columns = $this->schemaManager->listTableColumns($name);
        return Stream::of($data)->filter(function ($value, $key) use ($columns) {
            return array_key_exists($key, $columns);
        });
    }
    
    /**
     * Return a stream with types.
     * 
     * @param string $name resource name.
     * @param array $data
     * @return Stream
     */
    public function parameterTypes($name, array $data)
    {
        $columns = $this->schemaManager->listTableColumns($name);
        return $this->filter($name, $data)->map(function ($value, $key) use ($columns) {
            return $columns[$key]->getType();
        });
    }
    
    
}
