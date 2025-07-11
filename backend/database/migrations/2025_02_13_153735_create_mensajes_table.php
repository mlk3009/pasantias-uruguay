<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->string('asunto');
            $table->text('mensaje');
            $table->boolean('solicitud')->default(false);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });

        // Obtener IDs de usuarios existentes
        $userIds = DB::table('users')->pluck('id')->toArray();
        
        if (count($userIds) > 0) {
            // Insertar 40 mensajes en la tabla 'mensajes'
            for ($i = 1; $i <= 40; $i++) {
                DB::table('mensajes')->insert([
                    'asunto' => 'Asunto ' . $i,
                    'mensaje' => 'Mensaje de prueba ' . $i,
                    'user_id' => $userIds[($i - 1) % count($userIds)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Insertar 20 mensajes adicionales con solicitud en true
            for ($i = 41; $i <= 60; $i++) {
                DB::table('mensajes')->insert([
                    'asunto' => 'Asunto ' . $i,
                    'mensaje' => 'Solicitud de prueba ' . $i,
                    'user_id' => $userIds[($i - 1) % count($userIds)],
                    'solicitud' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};