<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;


class PurchaseController extends Controller
{


    public function index()
    {

        $purchases = Purchase::with([
            'distributor',
            'purchaseDetails.book'
        ])
        ->latest()
        ->paginate(10);


        return response()->json([
            'success'=>true,
            'data'=>$purchases
        ]);

    }




    public function store(StorePurchaseRequest $request)
    {


        DB::beginTransaction();


        try{


            $subtotal = 0;


            foreach($request->items as $item)
            {

                $subtotal +=
                $item['qty'] *
                $item['harga_beli'];

            }




            $purchase = Purchase::create([

                'kode_pembelian'=>'PO-'.time(),

                'distributor_id'=>
                $request->distributor_id,

                'tanggal'=>
                $request->tanggal,

                'subtotal'=>$subtotal,

                'diskon'=>0,

                'pajak'=>0,

                'grand_total'=>$subtotal,

                'keterangan'=>
                $request->keterangan

            ]);






            foreach($request->items as $item)
            {


                $book = Book::findOrFail(
                    $item['book_id']
                );



                $stokAwal = $book->stok;



                $book->increment(
                    'stok',
                    $item['qty']
                );





                PurchaseDetail::create([

                    'purchase_id'=>$purchase->id,

                    'book_id'=>$book->id,

                    'qty'=>$item['qty'],

                    'harga_beli'=>$item['harga_beli'],

                    'subtotal'=>
                    $item['qty'] *
                    $item['harga_beli']

                ]);





                StockHistory::create([

                    'book_id'=>$book->id,

                    'user_id'=>$request->user()->id,

                    'type'=>'in',

                    'qty'=>$item['qty'],

                    'stok_sebelum'=>$stokAwal,

                    'stok_sesudah'=>$book->stok,

                    'keterangan'=>
                    'Pembelian '.$purchase->kode_pembelian

                ]);

            }





            DB::commit();



            return response()->json([

                'success'=>true,

                'message'=>'Pembelian berhasil disimpan',

                'data'=>$purchase->load(
                    'purchaseDetails.book'
                )

            ],201);



        }
        catch(\Exception $e)
        {


            DB::rollBack();


            return response()->json([

                'message'=>$e->getMessage()

            ],500);


        }


    }





    public function show(Purchase $purchase)
    {

        return response()->json([

            'success'=>true,

            'data'=>$purchase->load([
                'distributor',
                'purchaseDetails.book'
            ])

        ]);

    }



}