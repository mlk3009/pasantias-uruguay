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
        // Crear la tabla experiencia
        Schema::create('experiencia', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cv_id');
            $table->string('puesto', 100);
            $table->string('empresa', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('descripcion', 500)->nullable();
            $table->string('referencias', 255)->nullable();
            $table->foreign('cv_id')->references('id')->on('cv')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiencia');
    }
};