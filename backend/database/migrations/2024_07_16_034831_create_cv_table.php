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
        // Crear la tabla cv
        Schema::create('cv', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('estudiante_id');
            $table->string('nombre_completo', 100);
            $table->date('fecha_nacimiento');
            $table->string('nacionalidad', 50);
            $table->string('estado_civil', 50)->nullable(); 
            $table->string('licencia', 255)->nullable();
            $table->enum('genero', ['masculino', 'femenino', 'otro']);
            $table->string('carnet_de_conducir', 255)->nullable();
            $table->text('idiomas')->nullable();
            $table->foreign('estudiante_id')->references('id')->on('estudiante')->onDelete('cascade'); 
            $table->timestamps(); 
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

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

        // Crear la tabla educacion
        Schema::create('educacion', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cv_id');
            $table->string('nivel', 50);
            $table->string('institucion', 100);
            $table->string('titulo', 100);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('actualmente');
            $table->date('fin_estimado')->nullable();
            $table->string('descripcion', 500)->nullable();
            $table->foreign('cv_id')->references('id')->on('cv')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });

        // Crear la tabla habilidades
        Schema::create('habilidades', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cv_id');
            $table->string('habilidad', 100);
            $table->string('nivel', 50);
            $table->foreign('cv_id')->references('id')->on('cv')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });

        // Crear la tabla links
        Schema::create('links', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cv_id');
            $table->string('link', 255);
            $table->foreign('cv_id')->references('id')->on('cv')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('links');
        Schema::dropIfExists('habilidades');
        Schema::dropIfExists('educacion');
        Schema::dropIfExists('experiencia');
        Schema::dropIfExists('cv');
    }
}