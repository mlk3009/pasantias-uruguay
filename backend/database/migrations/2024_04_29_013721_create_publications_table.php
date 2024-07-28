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
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('salary');
            $table->string('location');
            $table->string('type');
            $table->string('time');
            $table->string('deathline');
            $table->string('postulation_way');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
            $table->timestamps();
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
