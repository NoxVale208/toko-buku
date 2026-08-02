<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;


Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me',[AuthController::class,'me']);
    Route::post('/logout',[AuthController::class,'logout']);
});


Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

});