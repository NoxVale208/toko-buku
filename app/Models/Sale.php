<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Sale extends Model
{

    protected $fillable = [

        'kode_transaksi',
        'user_id',
        'customer_name',
        'tanggal',
        'subtotal',
        'diskon',
        'pajak',
        'grand_total',
        'status'

    ];



    public function user()
    {
        return $this->belongsTo(
            User::class
        );
    }



    public function details()
    {
        return $this->hasMany(
            SaleDetail::class
        );
    }

}