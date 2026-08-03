<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * Customer upload bukti pembayaran
     */
    public function uploadProof(Request $request, $id)
    {
        $request->validate([
            'bukti_pembayaran' => 'required|image|max:2048'
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
            ->store('payment-proof','public');

        $payment->update([
            'bukti_pembayaran'=>$path
        ]);

        return response()->json([

            'message'=>'Bukti pembayaran berhasil diupload',
            'data'=>$payment
        ]);
    }

    /**
     * Kasir melihat pembayaran pending
     */
    public function pending()
    {

        $payments = Payment::with([
            'order.user'
        ])
        ->where('status','pending')
        ->get();

        return response()->json([
            'data'=>$payments
        ]);
    }

    /**
     * Kasir verifikasi pembayaran
     */
    public function verify(Request $request,$id)
    {
        $request->validate([
            'status'=>'required|in:verified,rejected'
        ]);

        $payment = Payment::findOrFail($id);

        $payment->update([
            'status'=>$request->status,
            'tanggal_bayar'=>now(),
            'verifier_id'=>Auth::id()
        ]);

        // kalau pembayaran berhasil
        if($request->status == 'verified'){

            $payment->order()->update([
                'status'=>'paid'
            ]);
        }

        return response()->json([

            'message'=>'Status pembayaran diperbarui',
            'data'=>$payment
        ]);
    }
}