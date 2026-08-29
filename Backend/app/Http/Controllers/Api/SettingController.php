<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class SettingController extends Controller
{

    public function index()
    {

        return response()->json([
            'success'=>true,
            'data'=>Setting::first()
        ]);

    }




    public function update(Request $request)
    {

        $request->validate([

            'nama_toko'=>'required|string',

            'email'=>'nullable|email',

        ]);



        $setting = Setting::first();


        $setting->update([

            'nama_toko'=>$request->nama_toko,

            'email'=>$request->email,

            'telepon'=>$request->telepon,

            'alamat'=>$request->alamat,

        ]);



        return response()->json([

            'success'=>true,

            'message'=>'Setting berhasil diperbarui',

            'data'=>$setting

        ]);

    }

}