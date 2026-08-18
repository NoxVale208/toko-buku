<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [

            'id'=>$this->id,


            'order'=>[

                'id'=>$this->order?->id,

                'kode_order'=>$this->order?->kode_order

            ],



            'sale'=>[

                'id'=>$this->sale?->id,

                'kode_transaksi'=>$this->sale?->kode_transaksi

            ],



            'metode'=>$this->metode_pembayaran,


            'jumlah_bayar'=>$this->jumlah_bayar,


            'status'=>$this->status,



            'bukti_pembayaran'=>

                $this->bukti_pembayaran

                ?

                asset(
                    'storage/'.
                    $this->bukti_pembayaran
                )

                :

                null,



            'tanggal_bayar'=>$this->tanggal_bayar,



            'verifier'=>

                $this->whenLoaded(
                    'verifier',
                    function(){

                        return [

                            'id'=>$this->verifier->id,

                            'name'=>$this->verifier->name

                        ];

                    }
                ),



            'created_at'=>$this->created_at

        ];
    }

}