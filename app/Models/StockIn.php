<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class StockIn extends Model
{

    protected $fillable = [

        'distributor_id',
        'tanggal',
        'total_harga'

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
            StockInDetail::class
        );
    }

}