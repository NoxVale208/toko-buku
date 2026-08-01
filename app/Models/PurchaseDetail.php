<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class PurchaseDetail extends Model
{

    protected $fillable = [

        'purchase_id',
        'book_id',
        'qty',
        'harga_beli',
        'subtotal'

    ];


    public function purchase()
    {
        return $this->belongsTo(
            Purchase::class
        );
    }


    public function book()
    {
        return $this->belongsTo(
            Book::class
        );
    }

}