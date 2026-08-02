<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [

            'items' => 'required|array|min:1',

            'items.*.book_id' => [
                'required',
                'exists:books,id'
            ],

            'items.*.qty' => [
                'required',
                'integer',
                'min:1'
            ],

            'catatan'=>'nullable|string'

        ];
    }
}