<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:users',
            'password'=>'required|min:6',
        ]);


        $user = User::create([

            'name'=>$request->name,

            'email'=>$request->email,

            'password'=>Hash::make(
                $request->password
            ),

            'role'=>'kasir'

        ]);


        $token = $user->createToken(
            'auth_token'
        )->plainTextToken;


        return response()->json([

            'message'=>'Register berhasil',

            'user'=>$user,

            'token'=>$token

        ],201);

    }



    public function login(Request $request)
    {

        $request->validate([

            'email'=>'required|email',

            'password'=>'required'

        ]);


        $user = User::where(
            'email',
            $request->email
        )->first();


        if(
            !$user ||
            !Hash::check(
                $request->password,
                $user->password
            )
        ){

            return response()->json([

                'message'=>'Email atau password salah'

            ],401);

        }



        $token = $user->createToken(
            'auth_token'
        )->plainTextToken;



        return response()->json([

            'message'=>'Login berhasil',

            'user'=>$user,

            'token'=>$token

        ]);

    }




    public function me(Request $request)
    {

        return response()->json(
            $request->user()
        );

    }




    public function logout(Request $request)
    {

        $request->user()
            ->currentAccessToken()
            ->delete();


        return response()->json([

            'message'=>'Logout berhasil'

        ]);

    }

}