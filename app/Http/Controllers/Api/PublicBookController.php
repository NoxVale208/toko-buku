<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class PublicBookController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::with([
                'category',
                'author',
                'publisher'
            ])
            ->where('status', 'published')
            ->when($request->search, function ($query) use ($request) {
                $query->where('judul', 'like', "%{$request->search}%");
            })
            ->when($request->category_id, function ($query) use ($request) {
                $query->where('category_id', $request->category_id);
            })
            ->orderBy('judul')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'message' => 'Daftar buku',
            'data' => $books
        ]);
    }

    public function show(Book $book)
    {
        if ($book->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.'
            ], 404);
        }

        $book->load([
            'category',
            'author',
            'publisher'
        ]);

        return response()->json([
            'success' => true,
            'data' => $book
        ]);
    }
}