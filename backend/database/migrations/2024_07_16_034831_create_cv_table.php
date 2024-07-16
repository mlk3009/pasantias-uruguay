<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCvTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cv', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('estudiante_id');
            $table->string('nombre_completo', 100);
            $table->date('fecha_nacimiento');
            $table->string('nacionalidad', 50);
            $table->enum('genero', ['masculino', 'femenino', 'otro']);
            $table->string('links', 255)->nullable();
            $table->string('formacion_academica', 500)->nullable();
            $table->string('experiencia', 500)->nullable();
            $table->string('carnet_de_conducir', 255)->nullable();
            $table->text('idiomas')->nullable();
            $table->foreign('estudiante_id')->references('id')->on('estudiante')->onDelete('cascade'); 
            $table->timestamps(); 
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cv');
    }
}
