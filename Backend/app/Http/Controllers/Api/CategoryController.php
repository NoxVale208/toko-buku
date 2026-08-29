<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $categories = Category::when($search, function ($query) use ($search) {
            $query->where('nama', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil diambil.',
            'data' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create([
            'nama' => $request->nama,
            'slug' => Str::slug($request->nama),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update([
            'nama' => $request->nama,
            'slug' => Str::slug($request->nama),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}