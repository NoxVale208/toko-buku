<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class StockHistory extends Model
{

    protected $fillable = [

        'book_id',
        'user_id',
        'type',
        'qty',
        'stok_sebelum',
        'stok_sesudah',
        'keterangan'

    ];



    public function book()
    {
        return $this->belongsTo(
            Book::class
        );
    }

}