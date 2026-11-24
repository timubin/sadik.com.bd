<?php

namespace App\Services\Payment;

use App\Models\Order;

class CodGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $payload = []): array
    {
        return [
            'status' => 'pending',
            'reference' => 'COD-' . $order->order_number,
            'message' => 'Cash on Delivery selected. Pay upon receiving your order.',
            'redirect_url' => null,
        ];
    }
}
