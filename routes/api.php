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
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\UserController;

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
| PUBLIC BOOK
|--------------------------------------------------------------------------
*/

Route::get('/books',[BookController::class,'publicIndex']);
Route::get('/books/{book}',[BookController::class,'publicShow']);


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:admin'])->group(function(){

    // USER
    Route::get('/users',[UserController::class,'index']);
    Route::post('/users',[UserController::class,'store']);
    Route::get('/users/{user}',[UserController::class,'show']);
    Route::put('/users/{user}',[UserController::class,'update']);
    Route::delete('/users/{user}',[UserController::class,'destroy']);


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
    Route::get('/books-management',[BookController::class,'index']);
    Route::post('/books',[BookController::class,'store']);
    Route::get('/books/{book}',[BookController::class,'show']);
    Route::put('/books/{book}',[BookController::class,'update']);
    Route::delete('/books/{book}',[BookController::class,'destroy']);
    Route::post('/books/{book}/publish',[BookController::class,'publish']);


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

    // CART
    Route::get('/cart',[CartController::class,'index']);
    Route::post('/cart/add',[CartController::class,'add']);
    Route::put('/cart/update/{id}',[CartController::class,'update']);
    Route::delete('/cart/remove/{id}',[CartController::class,'remove']);


    // CHECKOUT
    Route::post('/checkout',[CheckoutController::class,'checkout']);


    // PAYMENT
    Route::post('/payment/{id}/upload',[PaymentController::class,'uploadProof']);


    // ORDER
    Route::get('/orders',[OrderController::class,'index']);
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


    // PAYMENT VERIFICATION
    Route::get('/payment/pending',[PaymentController::class,'pending']);
    Route::put('/payment/{id}/verify',[PaymentController::class,'verify']);


    // DASHBOARD
    Route::get('/dashboard',[DashboardController::class,'index']);
});


/*
|--------------------------------------------------------------------------
| KASIR
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','role:kasir'])->group(function(){

    // POS
    Route::post('/pos/transaction',[PosController::class,'store']);

    // SALES
    Route::get('/my-sales',[SaleController::class,'mySales']);
});