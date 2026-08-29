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

            'status'=>'required|in:verified,rejected',
            'jumlah_bayar'=>'nullable|numeric|min:0'
        ]);

        $payment = Payment::with([
            'order',
            'sale'
        ])

        ->findOrFail($id);

        $grandTotal = $payment->order->grand_total
            ?? $payment->sale->grand_total
            ?? 0;

        $kembalian = null;

        $updateData = [
            'status'=>$request->status,
            'tanggal_bayar'=>now(),
            'verified_by'=>Auth::id()
        ];

        if($request->status == 'verified'){

            if($payment->metode_pembayaran == 'tunai'){

                if(!$request->filled('jumlah_bayar')){
                    return response()->json([
                        'message'=>'Jumlah uang tunai wajib diisi'
                    ],422);
                }

                if($request->jumlah_bayar < $grandTotal){
                    return response()->json([
                        'message'=>'Jumlah uang kurang dari total tagihan'
                    ],422);
                }

                $updateData['jumlah_bayar'] = $request->jumlah_bayar;
                $kembalian = $request->jumlah_bayar - $grandTotal;

            } else {

                // transfer: kasir mengonfirmasi bukti sesuai nominal tagihan
                $updateData['jumlah_bayar'] = $grandTotal;
            }
        }

        $payment->update($updateData);

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
            'kembalian'=>$kembalian,
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