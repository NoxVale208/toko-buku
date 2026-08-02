<?php

namespace App\Http\Controllers\Api;

use App\Models\Publisher;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublisherRequest;
use App\Http\Requests\UpdatePublisherRequest;

class PublisherController extends Controller
{
    public function index(Request $request)
    {
        $publishers = Publisher::when($request->search, function($query) use($request){
            $query->where('nama','like',"%{$request->search}%");
        })
        ->latest()
        ->paginate(10);


        return response()->json([
            'success'=>true,
            'data'=>$publishers
        ]);
    }


    public function store(StorePublisherRequest $request)
    {
        $publisher = Publisher::create([
            'nama'=>$request->nama
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'Publisher berhasil ditambahkan',
            'data'=>$publisher
        ],201);
    }


    public function show(Publisher $publisher)
    {
        return response()->json([
            'success'=>true,
            'data'=>$publisher
        ]);
    }


    public function update(UpdatePublisherRequest $request, Publisher $publisher)
    {
        $publisher->update([
            'nama'=>$request->nama
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'Publisher berhasil diperbarui',
            'data'=>$publisher
        ]);
    }


    public function destroy(Publisher $publisher)
    {
        $publisher->delete();


        return response()->json([
            'success'=>true,
            'message'=>'Publisher berhasil dihapus'
        ]);
    }
}