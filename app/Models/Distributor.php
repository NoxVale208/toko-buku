<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Distributor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_distributor',
        'nama',
    ];

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}