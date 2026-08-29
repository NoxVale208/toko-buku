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
        Schema::table('orders', function (Blueprint $table) {

    $table->enum('status',[
        'pending_payment',
        'waiting_confirmation',
        'paid',
        'processing',
        'completed',
        'cancelled'
    ])
    ->default('pending_payment')
    ->change();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
