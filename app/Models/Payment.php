<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Payment extends Model
{
    use HasFactory;



    protected $fillable = [
    'order_id',
    'sale_id',
    'metode_pembayaran',
    'bukti_pembayaran',
    'status',
    'tanggal_bayar',
    'verifier_id'
];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

}