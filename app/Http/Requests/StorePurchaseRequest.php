<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [

            'distributor_id'=>[
                'required',
                'exists:distributors,id'
            ],


            'tanggal'=>[
                'required',
                'date'
            ],


            'items'=>[
                'required',
                'array',
                'min:1'
            ],


            'items.*.book_id'=>[
                'required',
                'exists:books,id'
            ],


            'items.*.qty'=>[
                'required',
                'integer',
                'min:1'
            ],


            'items.*.harga_beli'=>[
                'required',
                'integer',
                'min:0'
            ],


            'keterangan'=>[
                'nullable',
                'string'
            ]

        ];
    }
}