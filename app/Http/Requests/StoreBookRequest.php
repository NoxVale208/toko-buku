<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [

            'kode_buku' => 'required|string|max:50|unique:books,kode_buku',
            'barcode' => 'nullable|string|max:50|unique:books,barcode',
            'category_id' => 'required|exists:categories,id',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'judul' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:50|unique:books,isbn',
            'tahun_terbit' => 'nullable|integer',
            'harga_beli' => 'required|integer|min:0',
            'harga_jual' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
            'minimal_stok' => 'nullable|integer|min:0',
            'cover' => 'nullable|image|max:2048',
            'deskripsi' => 'nullable|string',
            'status' => 'nullable|in:aktif,nonaktif',
        ];
    }
}