<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{

    public function checkout(Request $request)
    {
        $request->validate([
            'metode_pembayaran' => 'required|in:transfer,tunai',
            'catatan' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($request) {

            $user = Auth::user();

            $cart = Cart::with('cartDetails.book')
                ->where('user_id',$user->id)
                ->first();

            if(!$cart || $cart->cartDetails->count() == 0){

                return response()->json([
                    'message'=>'Keranjang kosong'
                ],400);
            }

            $subtotal = 0;

            foreach($cart->cartDetails as $item){

                if($item->book->stok < $item->qty){
                    return response()->json([
                        'message'=>"Stok {$item->book->judul} tidak cukup"
                    ],400);
                }

                $subtotal += $item->qty * $item->harga;
            }

            $order = Order::create([
                'kode_order' => 'ORD-'.strtoupper(Str::random(8)),
                'user_id'=>$user->id,
                'subtotal'=>$subtotal,
                'diskon'=>0,
                'pajak'=>0,
                'grand_total'=>$subtotal,
                'status'=>'waiting_confirmation',
                'catatan'=>$request->catatan
            ]);

            foreach($cart->cartDetails as $item){

                OrderDetail::create([
                    'order_id'=>$order->id,
                    'book_id'=>$item->book_id,
                    'qty'=>$item->qty,
                    'harga'=>$item->harga,
                    'subtotal'=>$item->qty * $item->harga
                ]);

                $stokSebelum = $item->book->stok;


$item->book->decrement(
    'stok',
    $item->qty
);


$item->book->refresh();


StockHistory::create([

    'book_id'=>$item->book_id,

    'user_id'=>auth()->id(),

    'type'=>'out',

    'qty'=>$item->qty,

    'stok_sebelum'=>$stokSebelum,

    'stok_sesudah'=>$item->book->stok,

    'keterangan'=>
        'Penjualan order '.$order->kode_order

]);

            }

            Payment::create([
                'order_id'=>$order->id,
                'metode_pembayaran'=>$request->metode_pembayaran,
                'jumlah_bayar'=>$order->grand_total,
                'status'=>'pending'
            ]);

            // kosongkan cart
            $cart->cartDetails()->delete();

            return response()->json([

                'message'=>'Checkout berhasil',

                'data'=>$order->load(
                    'orderDetails.book',
                    'payment'
                )
            ]);
        });
    }
}