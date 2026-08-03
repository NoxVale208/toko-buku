<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\User;
use App\Models\Order;
use App\Models\Sale;
use App\Models\Payment;
use Illuminate\Http\Request;


class DashboardController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();

        if($user->role === 'admin'){

            return response()->json([

                'role'=>'admin',

                'data'=>[
                    'total_buku'=>Book::count(),
                    'total_customer'=>User::where('role','customer')->count(),
                    'stok_menipis'=>Book::whereColumn('stok','<=','minimal_stok')->count(),

                    'total_order'=>Order::count(),
                    'total_penjualan'=>Sale::count(),
                    'total_omzet'=>Sale::where('status','paid')->sum( 'grand_total')

                ]
            ]);
        }

        if($user->role === 'kasir'){

            return response()->json([

                'role'=>'kasir',
                'data'=>['transaksi_hari_ini'=>Sale::whereDate(

                        'tanggal', today())->count(),

                    'penjualan_hari_ini'=>Sale::whereDate(
                        'tanggal',today())
                    ->where(
                        'status','paid'
                    )
                    ->sum(
                        'grand_total'
                    ),

                    'pembayaran_pending'=>Payment::where('status','pending')->count(),
                    'total_transaksi'=>Sale::count()
                ]
            ]);
        }

        return response()->json([

            'message'=>'Role tidak tersedia'
        ],403);
    }
}