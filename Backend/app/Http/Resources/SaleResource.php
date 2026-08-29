<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'kode_transaksi'=>$this->kode_transaksi,
            'customer'=>[

                'id'=>$this->user?->id,
                'name'=>$this->user?->name
            ],

            'customer_name'=>$this->customer_name,
            'tanggal'=>$this->tanggal,

            'total'=>[
                'subtotal'=>$this->subtotal,
                'diskon'=>$this->diskon,
                'pajak'=>$this->pajak,
                'grand_total'=>$this->grand_total

            ],

            'status'=>$this->status,

            'items'=>
            $this->whenLoaded(
                'saleDetails',
                function(){

                    return $this->saleDetails
                    ->map(function($detail){

                        return [

                            'id'=>$detail->id,
                            'book'=>[
                                'id'=>$detail->book->id,
                                'judul'=>$detail->book->judul,
                                'cover'=>$detail->book->cover?
                                asset(
                                    'storage/'.$detail->book->cover
                                ):null

                            ],
                            'qty'=>$detail->qty,
                            'harga'=>$detail->harga,
                            'subtotal'=>$detail->subtotal

                        ];
                    });
                }
            ),

            'payment'=>$this->whenLoaded('payment',
                function(){

                    return [
                        'metode'=>$this->payment->metode_pembayaran,
                        'jumlah_bayar'=>$this->payment->jumlah_bayar,
                        'status'=>$this->payment->status,
                        'tanggal_bayar'=>$this->payment->tanggal_bayar

                    ];

                }
            ),

            'created_at'=>$this->created_at

        ];
    }

}