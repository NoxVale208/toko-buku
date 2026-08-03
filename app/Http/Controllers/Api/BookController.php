<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    // Semua buku untuk admin
    public function index()
    {
        $books = Book::with([
            'category',
            'author',
            'publisher'
        ])
        ->latest()
        ->get();

        return BookResource::collection($books);
    }

    // Tambah buku
    public function store(Request $request)
    {

        $request->validate([
            'kode_buku'=>'required|unique:books,kode_buku',
            'barcode'=>'nullable|unique:books,barcode',
            'category_id'=>'required|exists:categories,id',
            'author_id'=>'required|exists:authors,id',
            'publisher_id'=>'required|exists:publishers,id',
            'judul'=>'required|string',
            'isbn'=>'nullable|unique:books,isbn',
            'tahun_terbit'=>'nullable',
            'harga_beli'=>'required|integer',
            'harga_jual'=>'required|integer',
            'stok'=>'required|integer|min:0',
            'minimal_stok'=>'required|integer|min:0',
            'cover'=>'nullable|image|max:2048',
            'deskripsi'=>'nullable|string',
            'status'=>'nullable|in:draft,published,nonaktif'
        ]);

        $data = $request->except('cover');

        if($request->hasFile('cover')){

            $data['cover'] =
                $request->file('cover')
                ->store('books','public');
        }

        $book = Book::create($data);

        return response()->json([

            'message'=>'Buku berhasil ditambahkan',
            'data'=>$book
        ],201);
    }

    // Detail admin
    public function show(Book $book)
    {
        return new BookResource(
    $book->load([
        'category',
        'author',
        'publisher'
    ])
);
    }

    // Update buku
    public function update(Request $request, Book $book)
    {
        $request->validate([
            'kode_buku'=>"required|unique:books,kode_buku,$book->id",
            'barcode'=>"nullable|unique:books,barcode,$book->id",
            'isbn'=>"nullable|unique:books,isbn,$book->id",
            'harga_beli'=>'integer',
            'harga_jual'=>'integer',
            'stok'=>'integer|min:0',
            'minimal_stok'=>'integer|min:0',
            'status'=>'in:draft,published,nonaktif',
            'cover'=>'nullable|image|max:2048',
            'deskripsi'=>'nullable|string'
        ]);

        $data = $request->except('cover');

        if($request->hasFile('cover')){

            if($book->cover){

                Storage::disk('public')
                    ->delete($book->cover);
            }

            $data['cover'] =
                $request->file('cover')
                ->store('books','public');
        }

        $book->update($data);

        return response()->json([

            'message'=>'Buku berhasil diperbarui',
            'data'=>$book
        ]);
    }

    // Publish buku
    public function publish(Book $book)
    {
        $book->update([

            'status'=>'published'
        ]);

        return response()->json([

            'message'=>'Buku berhasil dipublish',
            'data'=>$book
        ]);
    }

    // Hapus buku
    public function destroy(Book $book)
    {

        if($book->cover){

            Storage::disk('public')
                ->delete($book->cover);

        }

        $book->delete();

        return response()->json([

            'message'=>'Buku berhasil dihapus'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER PUBLIC
    |--------------------------------------------------------------------------
    */

    // List buku yang sudah publish
    public function publicIndex()
    {

        $books = Book::with([

            'category',
            'author',
            'publisher'

        ])

        ->where('status','published')
        ->latest()
        ->get();

        return BookResource::collection($books);
    }

    // Detail buku customer
    public function publicShow(Book $book)
    {

        if($book->status !== 'published'){

            return response()->json([

                'message'=>'Buku tidak tersedia'
            ],404);
        }

        return new BookResource(
    $book->load([
        'category',
        'author',
        'publisher'
    ])
);
    }
}