<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{

    /*
    |--------------------------------------------------------------------------
    | LIST USER
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {

        $users = User::latest()
            ->when($request->search, function($query) use($request){

                $query->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");

            })
            ->when($request->role, function($query) use($request){

                $query->where('role', $request->role);

            })
            ->paginate(10)
            ->withQueryString();


        return UserResource::collection($users);

    }



    /*
    |--------------------------------------------------------------------------
    | DETAIL USER
    |--------------------------------------------------------------------------
    */

    public function show(User $user)
    {

        return new UserResource($user);

    }




    /*
    |--------------------------------------------------------------------------
    | CREATE USER (ADMIN)
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {

        $request->validate([

            'name'=>'required|string',

            'email'=>'required|email|unique:users',

            'password'=>'required|min:8',

            'role'=>'required|in:admin,kasir,customer'

        ]);



        $user = User::create([

            'name'=>$request->name,

            'email'=>$request->email,

            'password'=>Hash::make(
                $request->password
            ),

            'role'=>$request->role

        ]);



        return new UserResource($user);

    }





    /*
    |--------------------------------------------------------------------------
    | UPDATE USER
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, User $user)
    {


        $request->validate([

            'name'=>'required|string',

            'email'=>"required|email|unique:users,email,$user->id",

            'role'=>'required|in:admin,kasir,customer'

        ]);



        $user->update([

            'name'=>$request->name,

            'email'=>$request->email,

            'role'=>$request->role

        ]);



        return new UserResource($user);

    }





    /*
    |--------------------------------------------------------------------------
    | DELETE USER
    |--------------------------------------------------------------------------
    */

    public function destroy(User $user)
    {

        $user->delete();


        return response()->json([

            'message'=>'User berhasil dihapus'

        ]);

    }

}