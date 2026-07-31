<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_in_details', function(Blueprint $table){

    $table->id();


    $table->foreignId('stock_in_id')
        ->constrained()
        ->cascadeOnDelete();


    $table->foreignId('book_id')
        ->constrained()
        ->cascadeOnDelete();


    $table->integer('jumlah');


    $table->integer('harga_beli');


    $table->integer('subtotal');


    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_in_details');
    }
};
