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

        Schema::create('saldo', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->integer('days');
            $table->integer('pack')->default(1); // Cambiar nullable a default 1
            $table->decimal('precio', 8, 2);
            $table->timestamps();
        });

        Schema::create('necesita', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresa')->onDelete('cascade');
            $table->foreignId('saldo_id')->constrained('saldo')->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamps();
        });

        // Insertar registros en la tabla saldo
        DB::table('saldo')->insert([
            ['type' => 'Normal', 'days' => 15, 'pack' => 1, 'precio' => 1000],
            ['type' => 'Normal', 'days' => 30, 'pack' => 1, 'precio' => 1500],
            ['type' => 'Normal', 'days' => 60, 'pack' => 1, 'precio' => 2000],

            ['type' => 'Destacada', 'days' => 15, 'pack' => 1, 'precio' => 3000],
            ['type' => 'Destacada', 'days' => 30, 'pack' => 1, 'precio' => 4200],
            ['type' => 'Destacada', 'days' => 60, 'pack' => 1, 'precio' => 5400],

            ['type' => 'Normal', 'days' => 60, 'pack' => 3, 'precio' => 5400],
            ['type' => 'Normal', 'days' => 60, 'pack' => 5, 'precio' => 8000],
            ['type' => 'Normal', 'days' => 60, 'pack' => 10, 'precio' => 14000],
            ['type' => 'Normal', 'days' => 60, 'pack' => 20, 'precio' => 24000],
            ['type' => 'Normal', 'days' => 60, 'pack' => 30, 'precio' => 33000],
            
            ['type' => 'Destacada', 'days' => 30, 'pack' => 3, 'precio' => 11340],
            ['type' => 'Destacada', 'days' => 30, 'pack' => 5, 'precio' => 16800],
            ['type' => 'Destacada', 'days' => 30, 'pack' => 10, 'precio' => 29400],
            ['type' => 'Destacada', 'days' => 30, 'pack' => 20, 'precio' => 50400],
            ['type' => 'Destacada', 'days' => 30, 'pack' => 30, 'precio' => 69300],
        ]);


        DB::table('necesita')->insert([
            [
                'empresa_id' => 2,
                'saldo_id' => DB::table('saldo')->where([
                    ['type', '=', 'Normal'],
                    ['days', '=', 15],
                    ['pack', '=', 1],
                    ['precio', '=', 1000]
                ])->value('id'),
                'quantity' => 1
            ],
            [
                'empresa_id' => 2,
                'saldo_id' => DB::table('saldo')->where([
                    ['type', '=', 'Destacada'],
                    ['days', '=', 30],
                    ['pack', '=', 10],
                    ['precio', '=', 29400]
                ])->value('id'),
                'quantity' => 10
            ]
        ]);
    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('necesita');
        Schema::dropIfExists('saldo');
    }
};