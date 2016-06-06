<?php

namespace Dime\Server\Responder;

use Psr\Http\Message\ResponseInterface;

class JsonResponder implements ResponderInterface
{
    public function respond(ResponseInterface $response, array $data, $status = 200) {
        return $response->withJson($data, $status,  JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE);
    }
}
