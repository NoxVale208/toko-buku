<?php

namespace App\Http\Controllers\Api;

use App\Models\Author;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $authors = Author::when($search, function ($query) use ($search) {
            $query->where('nama', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Data penulis berhasil diambil.',
            'data' => $authors,
        ]);
    }

    public function store(StoreAuthorRequest $request)
    {
        $author = Author::create([
            'nama' => $request->nama,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penulis berhasil ditambahkan.',
            'data' => $author,
        ], 201);
    }

    public function show(Author $author)
    {
        return response()->json([
            'success' => true,
            'data' => $author,
        ]);
    }

    public function update(UpdateAuthorRequest $request, Author $author)
    {
        $author->update([
            'nama' => $request->nama,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penulis berhasil diperbarui.',
            'data' => $author,
        ]);
    }

    public function destroy(Author $author)
    {
        $author->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penulis berhasil dihapus.',
        ]);
    }
}