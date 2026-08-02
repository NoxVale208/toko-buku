<?php

namespace App\Http\Controllers\Api;

use App\Models\Sale;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class SaleController extends Controller
{


    public function index(Request $request)
    {

        $sales = Sale::with([
            'user',
            'saleDetails.book'
        ])

        ->when($request->search, function($query) use($request){

            $query->where(
                'kode_transaksi',
                'like',
                "%{$request->search}%"
            )

            ->orWhere(
                'customer_name',
                'like',
                "%{$request->search}%"
            );

        })


        ->when($request->tanggal, function($query) use($request){

            $query->whereDate(
                'tanggal',
                $request->tanggal
            );

        })


        ->latest()
        ->paginate(10);



        return response()->json([

            'success'=>true,

            'data'=>$sales

        ]);

    }





    public function show(Sale $sale)
    {


        return response()->json([

            'success'=>true,

            'data'=>$sale->load([
                'user',
                'saleDetails.book'
            ])

        ]);

    }





    public function mySales(Request $request)
    {

        $sales = Sale::with(
            'saleDetails.book'
        )
        ->where(
            'user_id',
            $request->user()->id
        )
        ->latest()
        ->paginate(10);



        return response()->json([

            'success'=>true,

            'data'=>$sales

        ]);

    }

}