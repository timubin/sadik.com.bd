<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Support\Str;

/**
 * Mock bKash payment gateway.
 * Replace process() implementation with live bKash Tokenized Checkout API calls when ready.
 */
class BkashGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $payload = []): array
    {
        $trxId = $payload['payment_reference'] ?? ('BKASH-MOCK-' . strtoupper(Str::random(8)));

        return [
            'status' => 'paid',
            'reference' => $trxId,
            'message' => 'bKash payment verified (mock mode).',
            'redirect_url' => null,
        ];
    }
}
