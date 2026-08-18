<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Book;
use App\Models\Payment;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    /**
     * Transaksi kasir
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name'=>'nullable|string',
            'items'=>'required|array',
            'items.*.book_id'=>'required|exists:books,id',
            'items.*.qty'=>'required|integer|min:1'
        ]);

        return DB::transaction(function() use($request){
            $subtotal = 0;

            // cek stok dan hitung total
            foreach($request->items as $item){

                $book = Book::findOrFail(
                    $item['book_id']
                );

                if($book->stok < $item['qty']){
                    return response()->json([
                        'message'=>"Stok {$book->judul} tidak cukup"
                    ],400);
                }

                $subtotal += 
                    $book->harga_jual * $item['qty'];
            }

            // buat sale
            $sale = Sale::create([
                'kode_transaksi'=>'TRX-'.strtoupper(Str::random(8)),
                'user_id'=>Auth::id(),
                'customer_name'=>$request->customer_name,
                'tanggal'=>now(),
                'subtotal'=>$subtotal,
                'diskon'=>0,
                'pajak'=>0,
                'grand_total'=>$subtotal,
                'status'=>'paid'
            ]);

            foreach($request->items as $item){

                $book = Book::findOrFail(
                    $item['book_id']
                );

                SaleDetail::create([
                    'sale_id'=>$sale->id,
                    'book_id'=>$book->id,
                    'qty'=>$item['qty'],
                    'harga'=>$book->harga_jual,
                    'subtotal'=>$book->harga_jual * $item['qty']
                ]);

                // kurangi stok
                $stokSebelum = $book->stok;


$book->decrement(
    'stok',
    $item['qty']
);


$book->refresh();


StockHistory::create([

    'book_id'=>$book->id,

    'user_id'=>auth()->id(),

    'type'=>'out',

    'qty'=>$item['qty'],

    'stok_sebelum'=>$stokSebelum,

    'stok_sesudah'=>$book->stok,

    'keterangan'=>
        'Penjualan tunai '.$sale->kode_transaksi

]);
            }

            // payment tunai
            Payment::create([
                'sale_id'=>$sale->id,
                'metode_pembayaran'=>'tunai',
                'jumlah_bayar'=>$sale->grand_total,
                'status'=>'verified',
                'tanggal_bayar'=>now(),
                'verified_by'=>Auth::id()
            ]);

            return response()->json([

                'message'=>'Transaksi berhasil',
                'data'=>$sale->load(
                    'saleDetails.book',
                    'payment'
                )
            ]);
        });
    }
}