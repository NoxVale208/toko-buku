<?php

namespace App\Http\Controllers\Api;

use App\Models\Author;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAuthorRequest;
use App\Http\Requests\UpdateAuthorRequest;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $authors = Author::when($request->search, function ($query) use ($request) {
            $query->where('nama', 'like', "%{$request->search}%");
        })
        ->latest()
        ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $authors
        ]);
    }


    public function store(StoreAuthorRequest $request)
    {
        $author = Author::create([
            'nama' => $request->nama
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Author berhasil ditambahkan',
            'data' => $author
        ],201);
    }


    public function show(Author $author)
    {
        return response()->json([
            'success'=>true,
            'data'=>$author
        ]);
    }


    public function update(UpdateAuthorRequest $request, Author $author)
    {
        $author->update([
            'nama'=>$request->nama
        ]);

        return response()->json([
            'success'=>true,
            'message'=>'Author berhasil diperbarui',
            'data'=>$author
        ]);
    }


    public function destroy(Author $author)
    {
        $author->delete();

        return response()->json([
            'success'=>true,
            'message'=>'Author berhasil dihapus'
        ]);
    }
}