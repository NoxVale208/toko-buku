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
        Schema::create('stock_ins', function(Blueprint $table){

    $table->id();


    $table->foreignId('distributor_id')
        ->constrained()
        ->cascadeOnDelete();


    $table->date('tanggal');


    $table->integer('total_harga')
        ->default(0);


    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_ins');
    }
};
