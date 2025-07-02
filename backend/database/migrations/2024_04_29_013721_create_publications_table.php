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
            $table->text('description')->nullable();
            $table->unsignedInteger('visitas')->default(0);
            $table->text('description2')->nullable();
            $table->text('description3')->nullable();
            $table->decimal('salary', 10, 2); // Cambiado a decimal para manejar valores monetarios
            $table->string('location');
            $table->string('type')->nullable();
            $table->string('time')->nullable();
            $table->unsignedInteger('vacancies'); // Cambiado a unsignedInteger para solo números positivos
            $table->string('deathline');
            $table->boolean('is_deleted')->default(false);
            $table->foreignId('empresa_id')->constrained('empresa')->onDelete('cascade');
            $table->boolean('featured')->default(false);
            $table->timestamps();
            $table->engine = 'InnoDB';
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