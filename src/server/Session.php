<?php

namespace Dime\Server;

class Session
{
    private $userId = 1;
    
    public function getUserId()
    {
        return $this->userId;
    }

    public function setUserId($userId)
    {
        $this->userId = $userId;
        return $this;
    }

}
