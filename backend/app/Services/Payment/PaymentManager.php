<?php

namespace App\Services\Payment;

use InvalidArgumentException;

class PaymentManager
{
    public function driver(string $method): PaymentGatewayInterface
    {
        return match ($method) {
            'cod' => new CodGateway(),
            'bkash' => new BkashGateway(),
            'nagad' => new NagadGateway(),
            default => throw new InvalidArgumentException("Unsupported payment method: {$method}"),
        };
    }
}
