<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,           // Primero los usuarios (empresas, estudiantes, admins)
            PublicationSeeder::class,    // Luego las publicaciones (requiere empresas)
            PostulaSeeder::class,        // Las postulaciones (requiere publicaciones y estudiantes)
            SaldoEmpresaSeeder::class,   // Los saldos de empresas (requiere empresas)
        ]);
    }
}
