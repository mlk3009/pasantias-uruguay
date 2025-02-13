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
            $table->string('phone', 9)->unique();
            $table->string('password');
            $table->string('remember_token', 100)->nullable();
            $table->boolean('is_suspended')->default(false);
            $table->enum('rol', ['administrador', 'estudiante', 'empresa']);
            $table->timestamps();
            $table->engine = 'InnoDB';
        });

        Schema::create('administrador', function (Blueprint $table) {
            $table->string('ci_admin', 8);
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->primary('id');
            $table->engine = 'InnoDB'; 
        });

        Schema::create('empresa', function (Blueprint $table) {
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->string('aboutUs', 2000)->nullable(); 
            $table->string('sede', 100)->nullable(); 
            $table->string('desc1', 1000)->nullable(); 
            $table->string('desc2', 1000)->nullable(); 
            $table->string('desc3', 1000)->nullable(); 
            $table->primary('id');
            $table->timestamps();
            $table->engine = 'InnoDB'; 
        });

        Schema::create('estudiante', function (Blueprint $table) {
            $table->string('ci_estudiante', 8);
            $table->date('fec_nacimiento');
            $table->string('desc1', 280)->default('Descripción 1');
            $table->string('desc2', 280)->default('Descripción 2');
            $table->string('cod_postal', 5);
            $table->string('genero', 24)->nullable();
            $table->enum('location', [
                'Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida','Lavalleja',
                'Maldonado','Montevideo','Paysandú','Río Negro','Rivera','Rocha','Salto','San José',
                'Soriano','Tacuarembó','Treinta y Tres'
            ]);
            $table->timestamps();
            $table->foreignId('id')->constrained('users')->onDelete('cascade');
            $table->primary('id');
            $table->engine = 'InnoDB'; 
        });



        
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->engine = 'InnoDB'; 
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
            $table->engine = 'InnoDB'; 
        });

        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->string('asunto');
            $table->text('mensaje');
            $table->string('mail');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->engine = 'InnoDB';
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
