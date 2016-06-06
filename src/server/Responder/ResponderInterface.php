<?php

namespace Dime\Server\Responder;

use Psr\Http\Message\ResponseInterface;

interface ResponderInterface
{
    public function respond(ResponseInterface $response, array $data, $status = 200);
}
