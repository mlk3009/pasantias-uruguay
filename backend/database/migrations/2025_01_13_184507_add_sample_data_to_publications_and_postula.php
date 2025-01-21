<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {   

                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo',
                    'email' => 'estudiante@example.com',
                    'phone' => '123456789',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '12345678',
                    'fec_nacimiento' => '2000-01-01',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);

                DB::table('users')->insert([
                    'name' => 'Empresa Ejemplo',
                    'email' => 'empresa@example.com',
                    'phone' => '987654321',
                    'password' => Hash::make('password'),
                    'rol' => 'empresa',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Obtener el ID del usuario empresa recién insertado
                $empresaUserId = DB::getPdo()->lastInsertId();

                // Insertar el registro en la tabla empresa
                DB::table('empresa')->insert([
                    'id' => $empresaUserId,
                ]);

        // Insertar datos en la tabla publications
        DB::table('publications')->insert([
            [
                'id' => 1,
                'title' => 'Desarrollador Web',
                'description' => 'Desarrollador web con experiencia en Laravel y Vue.js.',
                'salary' => '30000',
                'location' => 'Montevideo',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-12-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 3, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 2,
                'title' => 'Diseñador Gráfico',
                'description' => 'Diseñador gráfico con experiencia en Adobe Photoshop e Illustrator.',
                'salary' => '25000',
                'location' => 'Canelones',
                'type' => 'Part-time',
                'time' => '10:00 - 14:00',
                'deathline' => '2025-11-30',
                'postulation_way' => 'Envío de portafolio',
                'user_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 3,
                'title' => 'Analista de Datos',
                'description' => 'Analista de datos con experiencia en SQL y Python.',
                'salary' => '35000',
                'location' => 'Salto',
                'type' => 'Full-time',
                'time' => '8:00 - 17:00',
                'deathline' => '2025-10-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 4,
                'title' => 'Administrador de Sistemas',
                'description' => 'Administrador de sistemas con experiencia en Linux y Windows Server.',
                'salary' => '40000',
                'location' => 'Paysandú',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-09-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 5,
                'title' => 'Especialista en Marketing Digital',
                'description' => 'Especialista en marketing digital con experiencia en SEO y SEM.',
                'salary' => '28000',
                'location' => 'Maldonado',
                'type' => 'Part-time',
                'time' => '10:00 - 14:00',
                'deathline' => '2025-08-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 6,
                'title' => 'Ingeniero de Software',
                'description' => 'Ingeniero de software con experiencia en Java y Spring Boot.',
                'salary' => '45000',
                'location' => 'Colonia',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-07-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 3, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 7,
                'title' => 'Soporte Técnico',
                'description' => 'Soporte técnico con experiencia en hardware y software.',
                'salary' => '20000',
                'location' => 'Rivera',
                'type' => 'Part-time',
                'time' => '14:00 - 18:00',
                'deathline' => '2025-06-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 8,
                'title' => 'Desarrollador Mobile',
                'description' => 'Desarrollador mobile con experiencia en Android y iOS.',
                'salary' => '38000',
                'location' => 'Durazno',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-05-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 9,
                'title' => 'Consultor SAP',
                'description' => 'Consultor SAP con experiencia en módulos FI y CO.',
                'salary' => '50000',
                'location' => 'San José',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-04-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'id' => 10,
                'title' => 'Project Manager',
                'description' => 'Project manager con experiencia en metodologías ágiles.',
                'salary' => '55000',
                'location' => 'Florida',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-03-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
        ]);

        // Insertar datos en la tabla postula
        DB::table('postula')->insert([
            [
                'publication_id' => 1,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-01',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 2,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-02',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 3,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-03',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 4,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-04',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 5,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-05',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 6,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-06',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 7,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-07',
                'estado' => 'pendiente',
            ],
            [
                'publication_id' => 8,
                'estudiante_id' => 1,
                'postulation_date' => '2025-01-08',
                'estado' => 'pendiente',
            ],
        ]);


        DB::table('guarda')->insert([
            [
                'publication_id' => 1,
                'estudiante_id' => 1,
                'save_date' => '2025-01-01',
            ],
            [
                'publication_id' => 2,
                'estudiante_id' => 1,
                'save_date' => '2025-01-02',
            ],
            [
                'publication_id' => 3,
                'estudiante_id' => 1,
                'save_date' => '2025-01-03',
            ],
            [
                'publication_id' => 4,
                'estudiante_id' => 1,
                'save_date' => '2025-01-04',
            ],
        ]);
            }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar los datos insertados
        DB::table('postula')->where('estudiante_id', 1)->delete();
        DB::table('publications')->truncate();
    }
};