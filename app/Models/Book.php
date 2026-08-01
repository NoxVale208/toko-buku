<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use SoftDeletes;


    protected $fillable = [

        'kode_buku',
        'barcode',
        'category_id',
        'author_id',
        'publisher_id',
        'judul',
        'isbn',
        'tahun_terbit',
        'harga_beli',
        'harga_jual',
        'stok',
        'minimal_stok',
        'cover',
        'deskripsi'

    ];



    public function category()
    {
        return $this->belongsTo(Category::class);
    }


    public function author()
    {
        return $this->belongsTo(Author::class);
    }


    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }


    public function stockDetails()
    {
        return $this->hasMany(
            StockInDetail::class
        );
    }


    public function saleDetails()
    {
        return $this->hasMany(
            SaleDetail::class
        );
    }


    public function stockHistories()
    {
        return $this->hasMany(
            StockHistory::class
        );
    }

    public function purchaseDetails()
    {
        return $this->hasMany(
            PurchaseDetail::class
        );
    }
}
