<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone', 9);
            $table->string('password');
            $table->string('remember_token', 100)->nullable();
            $table->enum('rol', ['administrador', 'estudiante', 'empresa']);
            $table->timestamps();
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        Schema::create('administrador', function (Blueprint $table) {
            $table->string('ci_admin', 8);
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->primary('id');
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        Schema::create('empresa', function (Blueprint $table) {
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->primary('id');
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        Schema::create('estudiante', function (Blueprint $table) {
            $table->string('ci_estudiante', 8);
            //$table->string('fec_nacimiento');
            $table->string('cod_postal', 5);
            $table->enum('location', [
                'Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida','Lavalleja',
                'Maldonado','Montevideo','Paysandu','Río Negro','Rivera','Rocha','Salto','San José',
                'Soriano','Tacuarembo','Treinta y Tres']);
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->primary('id');
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
            $table->engine = 'InnoDB'; // Especificar el motor de almacenamiento
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('estudiante');
        Schema::dropIfExists('empresa');
        Schema::dropIfExists('administrador');
        Schema::dropIfExists('users');
    }
};
