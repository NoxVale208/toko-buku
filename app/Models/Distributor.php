<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Distributor extends Model
{
   use SoftDeletes;


    protected $fillable = [
        'kode_distributor',
        'nama',
    ];


    public function stockIns()
    {
        return $this->hasMany(StockIn::class);
    } 

    public function purchases()
    {
        return $this->hasMany(
            Purchase::class
        );
    }

}
