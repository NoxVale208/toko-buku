<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class StockInDetail extends Model
{

    protected $fillable = [

        'stock_in_id',
        'book_id',

        'jumlah',
        'harga_beli',
        'subtotal'

    ];



    public function stockIn()
    {
        return $this->belongsTo(
            StockIn::class
        );
    }



    public function book()
    {
        return $this->belongsTo(
            Book::class
        );
    }

}