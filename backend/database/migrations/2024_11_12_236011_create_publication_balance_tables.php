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

        Schema::create('saldo', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->integer('days');
            $table->timestamps();
        });

        Schema::create('necesita', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresa')->onDelete('cascade');
            $table->foreignId('saldo_id')->constrained('saldo')->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('necesita');
        Schema::dropIfExists('saldo');
    }
};