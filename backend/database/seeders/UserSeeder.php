<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuarios con rol empresa
        for ($i = 1; $i <= 5; $i++) {
            $userId = DB::table('users')->insertGetId([
                'name' => "Empresa $i",
                'email' => "empresa$i@example.com",
                'phone' => "09" . str_pad($i, 7, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'rol' => 'empresa',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insertar datos en tabla empresa
            DB::table('empresa')->insert([
                'id' => $userId,
                'aboutUs' => "Somos la empresa $i, dedicada a brindar excelentes oportunidades laborales.",
                'sede' => "Sede $i - Montevideo",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Usuarios con rol estudiante
        $departamentos = ['Montevideo', 'Canelones', 'Maldonado', 'Paysandú', 'Salto'];
        $generos = ['Masculino', 'Femenino'];
        
        for ($i = 1; $i <= 5; $i++) {
            $userId = DB::table('users')->insertGetId([
                'name' => "Estudiante $i",
                'email' => "estudiante$i@example.com",
                'phone' => "09" . str_pad($i + 10, 7, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'rol' => 'estudiante',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insertar datos en tabla estudiante
            DB::table('estudiante')->insert([
                'id' => $userId,
                'ci_estudiante' => str_pad($i + 1000000, 8, '0', STR_PAD_LEFT),
                'fec_nacimiento' => '199' . rand(5, 9) . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'desc1' => "Estudiante apasionado por la tecnología",
                'desc2' => "Buscando oportunidades de crecimiento profesional",
                'cod_postal' => str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT),
                'genero' => $generos[array_rand($generos)],
                'location' => $departamentos[array_rand($departamentos)],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Usuarios con rol administrador
        for ($i = 1; $i <= 2; $i++) {
            $userId = DB::table('users')->insertGetId([
                'name' => "Administrador $i",
                'email' => "admin$i@example.com",
                'phone' => "09" . str_pad($i + 20, 7, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'rol' => 'administrador',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insertar datos en tabla administrador
            DB::table('administrador')->insert([
                'id' => $userId,
                'ci_admin' => str_pad($i + 5000000, 8, '0', STR_PAD_LEFT),
            ]);
        }
    }
}
