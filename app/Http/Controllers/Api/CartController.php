<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartDetail;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Melihat isi keranjang customer
     */
    public function index()
    {
        $user = Auth::user();

        $cart = Cart::with('cartDetails.book')
            ->where('user_id', $user->id)
            ->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Keranjang kosong',
                'data' => []
            ]);
        }

        return response()->json([
            'message' => 'Data keranjang berhasil diambil',
            'data' => $cart
        ]);
    }

    /**
     * Tambah buku ke keranjang
     */
    public function add(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'qty' => 'required|integer|min:1'
        ]);

        $user = Auth::user();

        // Ambil / buat cart user
        $cart = Cart::firstOrCreate([
            'user_id' => $user->id
        ]);

        $book = Book::findOrFail($request->book_id);

        // Cek buku harus published
        if ($book->status !== 'published') {
            return response()->json([
                'message' => 'Buku belum tersedia'
            ], 400);
        }

        // Cek stok
        if ($book->stok < $request->qty) {
            return response()->json([
                'message' => 'Stok buku tidak mencukupi'
            ], 400);
        }

        // Kalau buku sudah ada di cart
        $detail = CartDetail::where('cart_id', $cart->id)
            ->where('book_id', $book->id)
            ->first();

        if ($detail) {

            $detail->update([
                'qty' => $detail->qty + $request->qty,
                'harga' => $book->harga_jual
            ]);

        } else {

            CartDetail::create([
                'cart_id' => $cart->id,
                'book_id' => $book->id,
                'qty' => $request->qty,
                'harga' => $book->harga_jual
            ]);
        }

        return response()->json([
            'message' => 'Buku berhasil ditambahkan ke keranjang'
        ]);
    }

    /**
     * Update jumlah buku
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1'
        ]);

        $detail = CartDetail::findOrFail($id);

        if ($detail->book->stok < $request->qty) {
            return response()->json([
                'message' => 'Stok tidak mencukupi'
            ],400);
        }

        $detail->update([
            'qty' => $request->qty
        ]);

        return response()->json([
            'message' => 'Jumlah buku diperbarui'
        ]);
    }

    /**
     * Hapus item cart
     */
    public function remove($id)
    {
        $detail = CartDetail::findOrFail($id);
        $detail->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus dari keranjang'
        ]);
    }
}