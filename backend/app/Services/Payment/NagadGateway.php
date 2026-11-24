<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Support\Str;

/**
 * Mock Nagad payment gateway.
 * Replace process() implementation with live Nagad Checkout API calls when ready.
 */
class NagadGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $payload = []): array
    {
        $trxId = $payload['payment_reference'] ?? ('NAGAD-MOCK-' . strtoupper(Str::random(8)));

        return [
            'status' => 'paid',
            'reference' => $trxId,
            'message' => 'Nagad payment verified (mock mode).',
            'redirect_url' => null,
        ];
    }
}
