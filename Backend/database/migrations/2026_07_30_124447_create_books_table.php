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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('kode_buku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained()->cascadeOnDelete();
            $table->foreignId('publisher_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->string('isbn')->nullable()->unique();
            $table->year('tahun_terbit')->nullable();
            $table->unsignedInteger('harga_beli');
            $table->unsignedInteger('harga_jual');
            $table->unsignedInteger('stok')->default(0);
            $table->unsignedInteger('minimal_stok')->default(5);
            $table->string('cover')->nullable();
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['draft','published','nonaktif'])->default('draft');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
