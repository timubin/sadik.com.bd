<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function getAllKeyed(): array
    {
        return static::query()
            ->get()
            ->mapWithKeys(function (self $item) {
                $decoded = json_decode((string) $item->value, true);
                return [$item->key => json_last_error() === JSON_ERROR_NONE ? $decoded : $item->value];
            })
            ->all();
    }
}
