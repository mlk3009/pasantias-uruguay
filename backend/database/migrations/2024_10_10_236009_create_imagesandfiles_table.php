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
        Schema::create('image_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->foreignId('estudiante_id')->nullable()->constrained('estudiante')->onDelete('cascade');
            $table->foreignId('publication_id')->nullable()->constrained('publications')->onDelete('cascade');
            $table->foreignId('empresa_id')->nullable()->constrained('empresa')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });

        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('file');
            $table->foreignId('estudiante_id')->nullable()->constrained('estudiante')->onDelete('cascade');
            $table->foreignId('empresa_id')->nullable()->constrained('empresa')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
        Schema::dropIfExists('image_uploads');
    }
};
