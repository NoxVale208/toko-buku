<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;


class UpdateBookRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {

        $book = $this->route('book');


        return [

            'kode_buku'=>[
                'required',
                Rule::unique('books')->ignore($book)
            ],


            'barcode'=>[
                'nullable',
                Rule::unique('books')->ignore($book)
            ],


            'category_id'=>'required|exists:categories,id',
            'author_id'=>'required|exists:authors,id',
            'publisher_id'=>'required|exists:publishers,id',
            'judul'=>'required|string|max:255',

            'isbn'=>[
                'nullable',
                Rule::unique('books')->ignore($book)
            ],

            'tahun_terbit'=>'nullable|integer',
            'harga_beli'=>'required|integer|min:0',
            'harga_jual'=>'required|integer|min:0',
            'stok'=>'required|integer|min:0',
            'minimal_stok'=>'nullable|integer|min:0',
            'cover'=>'nullable|image|max:2048',
            'deskripsi'=>'nullable|string',
            'status'=>'nullable|in:aktif,nonaktif',
        ];
    }
}