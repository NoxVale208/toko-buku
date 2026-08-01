<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
     use SoftDeletes;


    protected $fillable = [
        'nama',
        'slug'
    ];


    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
