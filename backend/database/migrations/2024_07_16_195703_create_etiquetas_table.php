<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear la tabla 'etiqueta'
        Schema::create('etiqueta', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });


        DB::table('etiqueta')->insert([
            ['name' => 'Backend Developer'],
            ['name' => 'Frontend Designer'],
            ['name' => 'Cybersecurity'],
            ['name' => 'Data Scientist'],
            ['name' => 'DevOps Engineer'],
            ['name' => 'Full Stack Developer'],
            ['name' => 'Machine Learning Engineer'],
            ['name' => 'Mobile Developer'],
            ['name' => 'Network Administrator'],
            ['name' => 'Product Manager'],
            ['name' => 'QA Engineer'],
            ['name' => 'Software Architect'],
            ['name' => 'System Administrator'],
            ['name' => 'UI/UX Designer'],
            ['name' => 'Licensed Driver'],
        ]);

        // Crear la tabla 'tiene'
        Schema::create('tiene', function (Blueprint $table) {
            $table->foreignId('estudiante_id')->constrained('estudiante')->onDelete('cascade');
            $table->foreignId('etiqueta_id')->constrained('etiqueta')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['estudiante_id', 'etiqueta_id']);
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        // Crear la tabla 'contiene'
        Schema::create('contiene', function (Blueprint $table) {
            $table->foreignId('etiqueta_id')->constrained('etiqueta')->onDelete('cascade');
            $table->foreignId('publication_id')->constrained('publications')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['etiqueta_id', 'publication_id']);
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contiene');
        Schema::dropIfExists('tiene');
        Schema::dropIfExists('etiqueta');
    }
};


