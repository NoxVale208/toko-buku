<?php

namespace App\Http\Controllers\Api;

use App\Models\Distributor;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDistributorRequest;
use App\Http\Requests\UpdateDistributorRequest;

class DistributorController extends Controller
{
    public function index(Request $request)
    {
        $distributors = Distributor::when($request->search, function($query) use($request){

            $query->where('nama','like',"%{$request->search}%")
                  ->orWhere('kode_distributor','like',"%{$request->search}%");

        })
        ->latest()
        ->paginate(10);


        return response()->json([
            'success'=>true,
            'data'=>$distributors
        ]);
    }


    public function store(StoreDistributorRequest $request)
    {
        $distributor = Distributor::create([
            'kode_distributor'=>$request->kode_distributor,
            'nama'=>$request->nama
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'Distributor berhasil ditambahkan',
            'data'=>$distributor
        ],201);
    }


    public function show(Distributor $distributor)
    {
        return response()->json([
            'success'=>true,
            'data'=>$distributor
        ]);
    }


    public function update(UpdateDistributorRequest $request, Distributor $distributor)
    {
        $distributor->update([
            'kode_distributor'=>$request->kode_distributor,
            'nama'=>$request->nama
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'Distributor berhasil diperbarui',
            'data'=>$distributor
        ]);
    }


    public function destroy(Distributor $distributor)
    {
        $distributor->delete();


        return response()->json([
            'success'=>true,
            'message'=>'Distributor berhasil dihapus'
        ]);
    }
}