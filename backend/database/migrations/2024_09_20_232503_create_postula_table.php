<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostulaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('postula', function (Blueprint $table) {
            $table->unsignedBigInteger('publication_id');
            $table->unsignedBigInteger('estudiante_id');
            $table->date('postulation_date');
            $table->string('estado'); // NO LO PUSE EN ENUM PARA PROBAR ALGO, LUEGO LO PONGO

            $table->foreign('publication_id')
                ->references('id')
                ->on('publications')
                ->onDelete('cascade');

            $table->foreign('estudiante_id')
                ->references('id')
                ->on('estudiante')
                ->onDelete('cascade');

            $table->primary(['publication_id', 'estudiante_id']);

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
        Schema::dropIfExists('postula');
    }
}