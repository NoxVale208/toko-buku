<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_pembelian',
        'distributor_id',
        'tanggal',
        'subtotal',
        'diskon',
        'pajak',
        'grand_total',
        'keterangan',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function distributor()
    {
        return $this->belongsTo(Distributor::class);
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}