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
                Schema::create('educacion', function (Blueprint $table) {
                    $table->bigIncrements('id');
                    $table->unsignedBigInteger('cv_id');
                    $table->string('nivel', 50);
                    $table->string('institucion', 100);
                    $table->string('titulo', 100);
                    $table->date('fecha_inicio');
                    $table->date('fecha_fin')->nullable();
                    $table->boolean('actualmente')->nullable();
                    $table->date('fin_estimado')->nullable();
                    $table->string('descripcion', 500)->nullable();
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
        Schema::dropIfExists('educacion');
    }
};