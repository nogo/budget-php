<?php

namespace Dime\Server\Middleware;

use Dime\Server\Session;
use Dime\Server\Responder\ResponderInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
 * Authorization is a middleware and read the HTTP header Authorization or X-Authorization.
 *
 * Tasks:
 * - MUST check realm configuration
 * - MUST check the username, client, token exists in storage
 * - MUST check the updated_at with the configured expire period
 * - MUST delete token when expired
 *
 * Header:
 * Authorization: REALM USER,CLIENT,TOKEN
 *
 * or
 *
 * X-Authorization: REALM USER,CLIENT,TOKEN
 *
 * @author Danilo Kuehn <dk@nogo-software.de>
 */
class AuthDigest
{

    private $responder;
    private $realm;
    private $access;

    /**
     * Constructor.
     */
    public function __construct(ResponderInterface $responder, $realm, array $access)
    {
        $this->responder = $responder;
        $this->realm = $realm;
        $this->access = $access;
    }

    public function __invoke(ServerRequestInterface $request, ResponseInterface $response, callable $next)
    {
        //Check header and header username
        if (empty($_SERVER['PHP_AUTH_DIGEST'])) {
            return $this->fail($response);
        } else {
            $data = $this->parseHttpDigest($_SERVER['PHP_AUTH_DIGEST']);
            if (!$data || !array_key_exists($data['username'], $this->access)) {
                return $this->fail($response);
            }
        }

        //Check header response
        $A1 = $this->access[$data['username']];
        $A2 = md5($_SERVER['REQUEST_METHOD'] . ':' . $data['uri']);
        $validResponse = md5($A1 . ':' . $data['nonce'] . ':' . $data['nc'] . ':' . $data['cnonce'] . ':' . $data['qop'] . ':' . $A2);
        if ($data['response'] !== $validResponse) {
            return $this->fail($response);
        }

        //By this point the request is authenticated
        return $next($request, $response);
    }

    protected function fail(ResponseInterface $response)
    {
        return $this->responder->respond($response
            ->withHeader('WWW-Authenticate', sprintf('Digest realm="%s",qop="auth",nonce="%s",opaque="%s"', $this->realm, uniqid(), md5($this->realm))),
            ['error' => 'Authentication error'],
            401
        );
    }

    /**
     * Parse HTTP Digest Authentication header
     *
     * @return array|false
     */
    protected function parseHttpDigest($headerValue)
    {
        $needed_parts = array('nonce' => 1, 'nc' => 1, 'cnonce' => 1, 'qop' => 1, 'username' => 1, 'uri' => 1, 'response' => 1);
        $data = array();
        $keys = implode('|', array_keys($needed_parts));
        preg_match_all('@(' . $keys . ')=(?:([\'"])([^\2]+?)\2|([^\s,]+))@', $headerValue, $matches, PREG_SET_ORDER);
        foreach ($matches as $m) {
            $data[$m[1]] = $m[3] ? $m[3] : $m[4];
            unset($needed_parts[$m[1]]);
        }
        return $needed_parts ? false : $data;
    }

}
