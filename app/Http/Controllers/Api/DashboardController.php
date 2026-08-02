<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\User;
use App\Models\Sale;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class DashboardController extends Controller
{

    public function index()
    {

        $totalBuku = Book::count();

        $totalKategori = Category::count();

        $totalCustomer = User::where(
            'role',
            'customer'
        )->count();


        $totalTransaksi = Sale::count();


        $pendapatan = Sale::sum(
            'grand_total'
        );


        $stokMenipis = Book::whereColumn(
            'stok',
            '<=',
            'minimal_stok'
        )
        ->get();



        $transaksiTerbaru = Sale::with(
            'user'
        )
        ->latest()
        ->limit(5)
        ->get();



        return response()->json([

            'success'=>true,

            'data'=>[

                'total_buku'=>$totalBuku,

                'total_kategori'=>$totalKategori,

                'total_customer'=>$totalCustomer,

                'total_transaksi'=>$totalTransaksi,

                'pendapatan'=>$pendapatan,

                'stok_menipis'=>$stokMenipis,

                'transaksi_terbaru'=>$transaksiTerbaru

            ]

        ]);

    }

}