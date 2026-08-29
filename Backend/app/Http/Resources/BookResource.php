<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'kode_buku' => $this->kode_buku,

            'barcode' => $this->barcode,

            'judul' => $this->judul,

            'isbn' => $this->isbn,

            'tahun_terbit' => $this->tahun_terbit,


            'harga' => [
                'beli' => $this->harga_beli,
                'jual' => $this->harga_jual,
            ],


            'stok' => [
                'tersedia' => $this->stok,
                'minimal' => $this->minimal_stok,
            ],


            'cover' => $this->cover
                ? asset('storage/'.$this->cover)
                : null,


            'deskripsi' => $this->deskripsi,


            'status' => $this->status,


            'category' => $this->whenLoaded(
                'category',
                function(){

                    return [
                        'id'=>$this->category->id,
                        'nama'=>$this->category->nama
                    ];

                }
            ),


            'author' => $this->whenLoaded(
                'author',
                function(){

                    return [
                        'id'=>$this->author->id,
                        'nama'=>$this->author->nama
                    ];

                }
            ),


            'publisher' => $this->whenLoaded(
                'publisher',
                function(){

                    return [
                        'id'=>$this->publisher->id,
                        'nama'=>$this->publisher->nama
                    ];

                }
            ),


            'created_at'=>$this->created_at

        ];
    }
}