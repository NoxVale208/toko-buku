<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'kode_pembelian',
        'distributor_id',
        'tanggal',
        'subtotal',
        'diskon',
        'pajak',
        'grand_total',
        'keterangan'
    ];


    public function distributor()
    {
        return $this->belongsTo(
            Distributor::class
        );
    }


    public function details()
    {
        return $this->hasMany(
            PurchaseDetail::class
        );
    }
}