<?php

namespace App\Services\Payment;

use App\Models\Order;

interface PaymentGatewayInterface
{
    /**
     * Initiate or verify a payment for the given order.
     *
     * @param array<string, mixed> $payload
     * @return array{status: string, reference: string, message: string, redirect_url?: string|null}
     */
    public function process(Order $order, array $payload = []): array;
}
