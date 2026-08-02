<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Book;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;


class OrderController extends Controller
{

    public function index(Request $request)
    {

        $orders = Order::with('orderDetails.book')
            ->where('user_id',$request->user()->id)
            ->latest()
            ->paginate(10);


        return response()->json([
            'success'=>true,
            'data'=>$orders
        ]);

    }

    public function store(StoreOrderRequest $request)
    {

        DB::beginTransaction();

        try {

            $subtotal = 0;

            foreach($request->items as $item)
            {
                $book = Book::findOrFail(
                    $item['book_id']
                );

                $subtotal +=
                $book->harga_jual *
                $item['qty'];
            }

            $order = Order::create([
                'kode_order'=>'ORD-'.time(),
                'user_id'=>$request->user()->id,
                'subtotal'=>$subtotal,
                'diskon'=>0,
                'pajak'=>0,
                'grand_total'=>$subtotal,
                'status'=>'pending',
                'catatan'=>$request->catatan
            ]);

            foreach($request->items as $item)
            {
                $book = Book::findOrFail(
                    $item['book_id']
                );

                OrderDetail::create([
                    'order_id'=>$order->id,
                    'book_id'=>$book->id,
                    'qty'=>$item['qty'],
                    'harga'=>$book->harga_jual,
                    'subtotal'=>$book->harga_jual *$item['qty']
                ]);
            }

            DB::commit();

            return response()->json([
                'success'=>true,
                'message'=>'Order berhasil dibuat',
                'data'=>$order->load(
                    'orderDetails.book'
                )
            ],201);

        } catch(\Exception $e){

            DB::rollBack();

            return response()->json([
                'message'=>$e->getMessage()
            ],500);
        }
    }

    public function show(Request $request, Order $order)
    {

        if($order->user_id != $request->user()->id)
        {
            return response()->json([
                'message'=>'Forbidden'
            ],403);
        }

        return response()->json([
            'success'=>true,
            'data'=>$order->load(
                'orderDetails.book'
            )
        ]);
    }
}