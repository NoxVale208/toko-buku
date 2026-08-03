<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [

            'id'=>$this->id,


            'kode_order'=>$this->kode_order,


            'customer'=>[

                'id'=>$this->user?->id,

                'name'=>$this->user?->name,

                'email'=>$this->user?->email

            ],



            'total'=>[

                'subtotal'=>$this->subtotal,

                'diskon'=>$this->diskon,

                'pajak'=>$this->pajak,

                'grand_total'=>$this->grand_total

            ],



            'status'=>$this->status,


            'catatan'=>$this->catatan,



            'items'=>
            $this->whenLoaded(
                'orderDetails',
                function(){


                    return $this->orderDetails
                    ->map(function($detail){


                        return [

                            'id'=>$detail->id,


                            'book'=>[

                                'id'=>$detail->book->id,

                                'judul'=>$detail->book->judul,

                                'cover'=>$detail->book->cover
                                ? asset(
                                    'storage/'.$detail->book->cover
                                  )
                                : null

                            ],



                            'qty'=>$detail->qty,


                            'harga'=>$detail->harga,


                            'subtotal'=>$detail->subtotal


                        ];


                    });


                }
            ),



            'payment'=>
            $this->whenLoaded(
                'payment',
                function(){

                    return [

                        'metode'=>$this->payment->metode,

                        'status'=>$this->payment->status,

                        'bukti_pembayaran'=>
                        $this->payment->bukti_pembayaran
                        ? asset(
                            'storage/'.
                            $this->payment->bukti_pembayaran
                          )
                        : null,


                        'tanggal_bayar'=>
                        $this->payment->tanggal_bayar
                    ];
                }
            ),

            'created_at'=>$this->created_at
        ];
    }
}