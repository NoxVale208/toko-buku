<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [

            'id'=>$this->id,


            'kode_pembelian'=>$this->kode_pembelian,


            'distributor'=>
            $this->whenLoaded(
                'distributor',
                function(){

                    return [

                        'id'=>$this->distributor->id,

                        'nama'=>$this->distributor->nama

                    ];

                }
            ),



            'tanggal'=>$this->tanggal,



            'total'=>[

                'subtotal'=>$this->subtotal,

                'diskon'=>$this->diskon,

                'pajak'=>$this->pajak,

                'grand_total'=>$this->grand_total

            ],



            'keterangan'=>$this->keterangan,



            'items'=>
            $this->whenLoaded(
                'purchaseDetails',
                function(){

                    return $this->purchaseDetails
                    ->map(function($detail){


                        return [

                            'id'=>$detail->id,


                            'book'=>[

                                'id'=>$detail->book->id,

                                'judul'=>$detail->book->judul

                            ],



                            'qty'=>$detail->qty,


                            'harga_beli'=>$detail->harga_beli,


                            'subtotal'=>$detail->subtotal


                        ];

                    });


                }
            ),



            'created_at'=>$this->created_at

        ];
    }

}