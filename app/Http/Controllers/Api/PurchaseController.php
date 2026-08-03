<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Book;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST PURCHASE
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $purchases = Purchase::with('distributor')
            ->latest()
            ->get();

        return response()->json([
            'data'=>$purchases
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DETAIL PURCHASE
    |--------------------------------------------------------------------------
    */

    public function show(Purchase $purchase)
    {
        return response()->json([
            'data'=>$purchase->load([
                'distributor',
                'purchaseDetails.book'
            ])
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PURCHASE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $request->validate([
            'distributor_id' =>
            'required|exists:distributors,id',
            'tanggal'=>'required|date',
            'items'=>'required|array',
            'items.*.book_id'=>'required|exists:books,id',
            'items.*.qty'=>'required|integer|min:1',
            'items.*.harga_beli'=>'required|integer|min:0',
            'keterangan'=>'nullable|string'
        ]);

        return DB::transaction(function() use ($request){

            $subtotal = 0;

            foreach($request->items as $item)
            {
                $subtotal += 
                    $item['qty'] *$item['harga_beli'];
            }

            $purchase = Purchase::create([
                'kode_pembelian' =>'PB-'.strtoupper(Str::random(8)),
                'distributor_id'=>$request->distributor_id,
                'tanggal'=>$request->tanggal,
                'subtotal'=>$subtotal,
                'diskon'=>0,
                'pajak'=>0,
                'grand_total'=> $subtotal,'keterangan'=>$request->keterangan
            ]);

            foreach($request->items as $item)
            {

                $book = Book::findOrFail( $item['book_id']);

                $stokSebelum = $book->stok;

                // tambah stok buku
                $book->increment('stok',$item['qty']);

                $book->refresh();

                PurchaseDetail::create([
                    'purchase_id'=>$purchase->id,
                    'book_id'=>$book->id,
                    'qty'=>$item['qty'],
                    'harga_beli'=>$item['harga_beli'],
                    'subtotal'=>$item['qty'] *$item['harga_beli']
                ]);

                StockHistory::create([
                    'book_id'=>$book->id,
                    'user_id'=>auth()->id(),
                    'type'=>'in',
                    'qty'=>$item['qty'],
                    'stok_sebelum'=>$stokSebelum,
                    'stok_sesudah'=>$book->stok,
                    'keterangan'=>'Pembelian '.$purchase->kode_pembelian
                ]);
            }

            return response()->json([

                'message'=>'Pembelian berhasil dibuat',
                'data'=>$purchase->load(['distributor','purchaseDetails.book'])
            ],201);
        });
    }
}