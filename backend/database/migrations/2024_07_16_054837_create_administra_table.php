<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdministraTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('administra', function (Blueprint $table) {
            $table->unsignedBigInteger('administrador_id'); 
            $table->unsignedBigInteger('publication_id'); 
            $table->enum('action', ['edicion', 'baja']);
            $table->timestamp('created_at')->useCurrent(); 

            $table->primary(['administrador_id', 'publication_id']);

            $table->foreign('administrador_id')
                ->references('id')
                ->on('administrador')
                ->onDelete('cascade');

            $table->foreign('publication_id')
                ->references('id')
                ->on('publications')
                ->onDelete('cascade');

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
        Schema::dropIfExists('administra');
    }
}
