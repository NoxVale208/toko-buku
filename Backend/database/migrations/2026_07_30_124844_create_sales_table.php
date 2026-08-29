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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name')->nullable();
            $table->dateTime('tanggal');
            $table->unsignedBigInteger('subtotal')->default(0);
            $table->unsignedBigInteger('diskon')->default(0);
            $table->unsignedBigInteger('pajak')->default(0);
            $table->unsignedBigInteger('grand_total')->default(0);
            $table->enum('status', ['pending', 'paid', 'cancel'])->default('paid');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
