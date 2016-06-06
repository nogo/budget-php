<?php

namespace Dime\Server;

class Stream
{

    private $data;

    public function __construct($data)
    {
        if (!self::can($data)) {
            throw new Exception('Data not an array or Traversable and could not used as stream.');
        }

        $this->data = $data;
    }

    /**
     * @param mixed $data array or Traversable
     * @return \self
     */
    public static function of($data)
    {
        return new self($data);
    }

    /**
     * Check if the data can be a stream.
     * @param \Traversable $data
     * @return boolean
     */
    public static function can($data)
    {
        return is_array($data) || ($data instanceof \Traversable);
    }

    /**
     * Append or merge the result of the callable into the data. If result has
     * integer key it will append, other key will merge and override.
     *
     * @param callable $function
     * @return self
     */
    public function append($function)
    {
        $result = call_user_func($function);

        foreach ($result as $key => $value) {
            if (is_int($key)) {
                $this->data[] = $value;
            } else {
                $this->data[$key] = $value;
            }
        }

        return $this;
    }

    /**
     * Check if stream data is empty.
     * @return boolean
     */
    public function isEmpty()
    {
        return emtpy($this->data);
    }

    /**
     * Return the internal data object.
     * @return Traversable
     */
    public function collect()
    {
        return $this->data;
    }

    /**
     * Iterate over each item and execute the consumer function.
     * @param callable $consumer Consumer function result will be ignored.
     * @return Stream
     */
    public function each($consumer)
    {
        foreach ($this->data as $key => $value) {
            call_user_func($consumer, $value, $key);
        }

        return $this;
    }

    /**
     * Execute a callable on the whole data object.
     *
     * Stream::of(['id' => 'test'])->execute(function ($data) { return $modifiedData; })->collect();
     *
     * @param callable $callable Callabe recieve the whole data object as first parameter.
     * @return Stream
     */
    public function execute($callable)
    {
        return self::of(call_user_func($callable, $this->data));
    }

    /**
     * Filte the stream of items with a function.
     * @param callable $function
     * @return Stream filtered items as Stream.
     */
    public function filter($function)
    {
        $result = [];

        foreach ($this->data as $key => $value) {
            if (call_user_func($function, $value, $key)) {
                $result[$key] = $value;
            }
        }

        return self::of($result);
    }

    /**
     * Accumulate all items and return the result.
     * @param callable $function
     * @param mixed $accumulator inital value.
     * @return Result of the accuumulation.
     */
    public function fold($function, $accumulator = null)
    {
        foreach ($this->data as $key => $value) {
            if (empty($accumulator)) {
                $accumulator = $value;
            } else {
                $accumulator = call_user_func($function, $accumulator, $value, $key);
            }
        }

        return $accumulator;
    }

    /**
     * Every item has to match with the function.
     * @param callable $function must return a boolean result.
     * @return boolean
     */
    public function matchAll($function)
    {
        $result = true;

        foreach ($this->data as $key => $value) {
            if (!call_user_func($function, $value, $key)) {
                $result = false;
                break;
            }
        }

        return $result;
    }

    /**
     * One or more items has to match with the function.
     * @param callable $function must return a boolean result.
     * @return boolean
     */
    public function matchAny($function)
    {
        $result = false;

        foreach ($this->data as $key => $value) {
            if (call_user_func($function, $value, $key)) {
                $result = true;
                break;
            }
        }

        return $result;
    }

    /**
     * Change the value, keep the key.
     * @param callable $function
     * @return Stream
     */
    public function map($function)
    {
        $result = [];

        foreach ($this->data as $key => $value) {
            $result[$key] = call_user_func($function, $value, $key);
        }

        return self::of($result);
    }

    /**
     * Change the key, keep the value.
     * @param callable $function
     * @return Stream
     */
    public function remap($function)
    {
        $result = [];

        foreach ($this->data as $key => $value) {
            $newkey = call_user_func($function, $value, $key);
            $result[$newkey] = $value;
        }

        return self::of($result);
    }

}
