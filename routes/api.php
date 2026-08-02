<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\DistributorController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingController;


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me',[AuthController::class,'me']);
    Route::post('/logout',[AuthController::class,'logout']);
});

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:admin'])->group(function(){
    // CATEGORY
    Route::get('/categories',[CategoryController::class,'index']);
    Route::post('/categories',[CategoryController::class,'store']);
    Route::get('/categories/{category}',[CategoryController::class,'show']);
    Route::put('/categories/{category}',[CategoryController::class,'update']);
    Route::delete('/categories/{category}',[CategoryController::class,'destroy']);
    // AUTHOR
    Route::get('/authors',[AuthorController::class,'index']);
    Route::post('/authors',[AuthorController::class,'store']);
    Route::get('/authors/{author}',[AuthorController::class,'show']);
    Route::put('/authors/{author}',[AuthorController::class,'update']);
    Route::delete('/authors/{author}',[AuthorController::class,'destroy']);
    // PUBLISHER
    Route::get('/publishers',[PublisherController::class,'index']);
    Route::post('/publishers',[PublisherController::class,'store']);
    Route::get('/publishers/{publisher}',[PublisherController::class,'show']);
    Route::put('/publishers/{publisher}',[PublisherController::class,'update']);
    Route::delete('/publishers/{publisher}',[PublisherController::class,'destroy']);
    // DISTRIBUTOR
    Route::get('/distributors',[DistributorController::class,'index']);
    Route::post('/distributors',[DistributorController::class,'store']);
    Route::get('/distributors/{distributor}',[DistributorController::class,'show']);
    Route::put('/distributors/{distributor}',[DistributorController::class,'update']);
    Route::delete('/distributors/{distributor}',[DistributorController::class,'destroy']);
    // BOOK
    Route::get('/books',[BookController::class,'index']);
    Route::post('/books',[BookController::class,'store']);
    Route::get('/books/{book}',[BookController::class,'show']);
    Route::put('/books/{book}',[BookController::class,'update']);
    Route::delete('/books/{book}',[BookController::class,'destroy']);
    // SETTING
    Route::get('/settings',[SettingController::class,'index']);
    Route::put('/settings',[SettingController::class,'update']);
});

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:customer'])->group(function(){
    // ORDER
    Route::get('/orders',[OrderController::class,'index']);
    Route::post('/orders',[OrderController::class,'store']);
    Route::get('/orders/{order}',[OrderController::class,'show']);

});

/*
|--------------------------------------------------------------------------
| ADMIN + KASIR
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:admin,kasir'])->group(function(){

    // ORDER MANAGEMENT
    Route::get('/orders-management',[AdminOrderController::class,'index']);
    Route::post('/orders/{order}/approve',[AdminOrderController::class,'approve']);
    Route::post('/orders/{order}/reject',[AdminOrderController::class,'reject']);

    // PURCHASE
    Route::get('/purchases',[PurchaseController::class,'index']);
    Route::post('/purchases',[PurchaseController::class,'store']);
    Route::get('/purchases/{purchase}',[PurchaseController::class,'show']);

    // SALES
    Route::get('/sales',[SaleController::class,'index']);
    Route::get('/sales/{sale}',[SaleController::class,'show']);

    // DASHBOARD
    Route::get('/dashboard',[DashboardController::class,'index']);
});

/*
|--------------------------------------------------------------------------
| KASIR
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:kasir'])->group(function(){
    Route::get('/my-sales',[SaleController::class,'mySales']);
});