<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Resources\PaymentResource;
use Illuminate\Support\Facades\Auth;


class PaymentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | CUSTOMER UPLOAD BUKTI PEMBAYARAN
    |--------------------------------------------------------------------------
    */

    public function uploadProof(Request $request, $id)
    {

        $request->validate([
            'bukti_pembayaran'=>'required|image|max:2048'

        ]);
        $payment = Payment::where('id',$id)

            ->whereHas('order', function($query){

                $query->where(
                    'user_id',
                    Auth::id()
                );

            })

            ->firstOrFail();

        if($payment->status !== 'pending'){

            return response()->json([

                'message'=>'Pembayaran sudah diproses'
            ],400);
        }

        $path = $request
            ->file('bukti_pembayaran')
            ->store(
                'payment-proof',
                'public'
            );
        $payment->update([

            'bukti_pembayaran'=>$path

        ]);

        // ubah status order menunggu konfirmasi
        if($payment->order){

            $payment->order()->update([
                'status'=>'waiting_confirmation'
            ]);
        }

        return response()->json([

            'message'=>'Bukti pembayaran berhasil diupload',
            'data'=>new PaymentResource(

                $payment->load([
                    'order',
                    'sale'

                ])
            )
        ]);
    }
    /*
    |--------------------------------------------------------------------------
    | KASIR MELIHAT PEMBAYARAN PENDING
    |--------------------------------------------------------------------------
    */
    public function pending()
    {
        $payments = Payment::with([

            'order.user',
            'sale',
            'verifier'

        ])

        ->where(
            'status','pending'
        )
        ->latest()
        ->get();

        return PaymentResource::collection(
            $payments
        );
    }

    /*
    |--------------------------------------------------------------------------
    | KASIR VERIFIKASI PEMBAYARAN
    |--------------------------------------------------------------------------
    */

    public function verify(Request $request,$id)
    {

        $request->validate([

            'status'=>'required|in:verified,rejected'
        ]);

        $payment = Payment::with([
            'order',
            'sale'
        ])

        ->findOrFail($id);

        $payment->update([

            'status'=>$request->status,
            'tanggal_bayar'=>now(),
            'verifier_id'=>Auth::id()
        ]);

        // jika pembayaran berhasil
        if(
            $request->status == 'verified'&&$payment->order
        ){
            $payment->order()->update([

                'status'=>'paid'
            ]);
        }

        return response()->json([

            'message'=>'Status pembayaran diperbarui',
            'data'=>new PaymentResource(

            $payment->load([
                    'order',
                    'sale',
                    'verifier'
                ])
            )
        ]);
    }
}