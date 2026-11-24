<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'min_order_amount' => 'float',
            'max_discount' => 'float',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function calculateDiscount(float $subtotal): float
    {
        if (!$this->is_active) {
            return 0.0;
        }
        if ($this->starts_at && now()->lt($this->starts_at)) {
            return 0.0;
        }
        if ($this->expires_at && now()->gt($this->expires_at)) {
            return 0.0;
        }
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 0.0;
        }
        if ($subtotal < $this->min_order_amount) {
            return 0.0;
        }

        $discount = $this->type === 'percent'
            ? ($subtotal * ($this->value / 100))
            : $this->value;

        if ($this->max_discount !== null && $discount > $this->max_discount) {
            $discount = $this->max_discount;
        }

        return round(min($discount, $subtotal), 2);
    }
}
