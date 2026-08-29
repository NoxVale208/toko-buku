<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;


class AdminOrderController extends Controller
{

    // Melihat semua order customer
    public function index(Request $request)
    {

        $orders = Order::with([
            'user',
            'orderDetails.book',
            'payment'
        ])
        ->when($request->search, function($query) use($request){

            $query->where('kode_order', 'like', "%{$request->search}%")
                ->orWhereHas('user', function($q) use($request){
                    $q->where('name', 'like', "%{$request->search}%");
                });

        })
        ->when($request->status, function($query) use($request){

            $query->where('status', $request->status);

        })
        ->latest()
        ->paginate(10)
        ->withQueryString();


        return response()->json([
            'success'=>true,
            'data'=>$orders
        ]);

    }



    // Melihat detail 1 order (untuk halaman detail admin)
    public function show(Order $order)
    {

        $order->load([
            'user',
            'orderDetails.book',
            'payment.verifier'
        ]);

        return response()->json([
            'success'=>true,
            'data'=>$order
        ]);

    }



    // Approve order
    public function approve(Request $request, Order $order)
    {

        if($order->status !== 'pending')
        {
            return response()->json([
                'message'=>'Order sudah diproses'
            ],400);
        }



        DB::beginTransaction();


        try{


            $sale = Sale::create([

                'kode_transaksi'=>'TRX-'.time(),

                'user_id'=>$request->user()->id,

                'customer_name'=>$order->user->name,

                'tanggal'=>now(),

                'subtotal'=>$order->subtotal,

                'diskon'=>$order->diskon,

                'pajak'=>$order->pajak,

                'grand_total'=>$order->grand_total,

                'status'=>'paid'

            ]);





            foreach($order->orderDetails as $detail)
            {


                $book = $detail->book;


                $stokAwal = $book->stok;


                if($book->stok < $detail->qty)
                {

                    throw new \Exception(
                        "Stok {$book->judul} tidak cukup"
                    );

                }



                $book->decrement(
                    'stok',
                    $detail->qty
                );




                SaleDetail::create([

                    'sale_id'=>$sale->id,

                    'book_id'=>$book->id,

                    'qty'=>$detail->qty,

                    'harga'=>$detail->harga,

                    'subtotal'=>$detail->subtotal

                ]);





                StockHistory::create([

                    'book_id'=>$book->id,

                    'user_id'=>$request->user()->id,

                    'type'=>'out',

                    'qty'=>$detail->qty,

                    'stok_sebelum'=>$stokAwal,

                    'stok_sesudah'=>$book->stok,

                    'keterangan'=>
                    'Penjualan order '.$order->kode_order

                ]);

            }



            $order->update([

                'status'=>'completed'

            ]);



            DB::commit();



            return response()->json([

                'success'=>true,

                'message'=>'Order berhasil diproses',

                'sale'=>$sale

            ]);



        }
        catch(\Exception $e)
        {

            DB::rollBack();


            return response()->json([

                'message'=>$e->getMessage()

            ],500);

        }

    }




    // Reject order

    public function reject(Order $order)
    {

        $order->update([

            'status'=>'rejected'

        ]);


        return response()->json([

            'success'=>true,

            'message'=>'Order ditolak'

        ]);

    }

}