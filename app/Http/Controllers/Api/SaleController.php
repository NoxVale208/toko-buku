<?php

namespace App\Http\Controllers\Api;

use App\Models\Sale;
use Illuminate\Http\Request;
use App\Http\Resources\SaleResource;
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



        return SaleResource::collection($sales);
    }

    public function show(Sale $sale)
    {


        return new SaleResource(

    $sale->load([
        'user',
        'saleDetails.book',
        'payment'
    ])
);

    }

    public function mySales()
{

    $sales = Sale::with([

        'saleDetails.book',

        'payment'

    ])
    ->where(
        'user_id',
        auth()->id()
    )
    ->latest()
    ->get();



    return SaleResource::collection($sales);

}

}