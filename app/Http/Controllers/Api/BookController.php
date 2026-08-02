<?php

namespace App\Http\Controllers\Api;


use App\Models\Book;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use Illuminate\Support\Facades\Storage;


class BookController extends Controller
{


    public function index(Request $request)
    {

        $books = Book::with([
            'category',
            'author',
            'publisher'
        ])
        ->when($request->search,function($query) use($request){

            $query->where('judul','like',"%{$request->search}%")
            ->orWhere('kode_buku','like',"%{$request->search}%")
            ->orWhere('isbn','like',"%{$request->search}%");

        })
            ->latest()
            ->paginate(10);

        return response()->json([

            'success'=>true,
            'data'=>$books
        ]);
    }

    public function store(StoreBookRequest $request)
    {

        $data = $request->validated();

        if($request->hasFile('cover')){

        $data['cover'] =$request->file('cover')->store('covers','public');

        }

        $book = Book::create($data);

        return response()->json([

            'success'=>true,
            'message'=>'Buku berhasil ditambahkan',
            'data'=>$book
        ],201);
    }

    public function show(Book $book)
    {

        return response()->json([

            'success'=>true,
            'data'=>$book->load([
                'category',
                'author',
                'publisher'
            ])

        ]);

    }

    public function update(UpdateBookRequest $request, Book $book)
    {

        $data=$request->validated();
        if($request->hasFile('cover')){
            if($book->cover){
                Storage::disk('public')->delete($book->cover);
            }

            $data['cover']= $request->file('cover') ->store('covers','public');
        }

        $book->update($data);

        return response()->json([
            'success'=>true,
            'message'=>'Buku berhasil diperbarui',
            'data'=>$book
        ]);

    }





    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json([

            'success'=>true,
            'message'=>'Buku berhasil dihapus'

        ]);

    }

}