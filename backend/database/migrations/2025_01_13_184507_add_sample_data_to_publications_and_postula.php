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
                    'genero' => 'Masculino',
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

        DB::table('publications')->insert([
            [
                'title' => 'Backend Developer',
                'description' => 'Desarrollador backend con experiencia en Node.js y MongoDB.',
                'salary' => '50000',
                'location' => 'Montevideo',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-05-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 2,
                'featured' => false,
            ],
            [
                'title' => 'Frontend Designer',
                'description' => 'Diseñador frontend con experiencia en React y CSS.',
                'salary' => '45000',
                'location' => 'Canelones',
                'type' => 'Part-time',
                'time' => '10:00 - 14:00',
                'deathline' => '2025-06-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Cybersecurity Specialist',
                'description' => 'Especialista en ciberseguridad con experiencia en análisis de vulnerabilidades.',
                'salary' => '60000',
                'location' => 'Maldonado',
                'type' => 'Full-time',
                'time' => '8:00 - 17:00',
                'deathline' => '2025-07-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Data Scientist',
                'description' => 'Científico de datos con experiencia en Python y R.',
                'salary' => '70000',
                'location' => 'Colonia',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-08-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'DevOps Engineer',
                'description' => 'Ingeniero DevOps con experiencia en AWS y Docker.',
                'salary' => '65000',
                'location' => 'Salto',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-09-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Full Stack Developer',
                'description' => 'Desarrollador full stack con experiencia en JavaScript y PHP.',
                'salary' => '55000',
                'location' => 'Paysandú',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-10-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Machine Learning Engineer',
                'description' => 'Ingeniero de aprendizaje automático con experiencia en TensorFlow.',
                'salary' => '75000',
                'location' => 'Rivera',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-11-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Mobile Developer',
                'description' => 'Desarrollador móvil con experiencia en Android y iOS.',
                'salary' => '50000',
                'location' => 'Tacuarembó',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-12-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Network Administrator',
                'description' => 'Administrador de redes con experiencia en Cisco y Juniper.',
                'salary' => '60000',
                'location' => 'Durazno',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-01-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Product Manager',
                'description' => 'Gerente de producto con experiencia en gestión de proyectos.',
                'salary' => '70000',
                'location' => 'Florida',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-02-28',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'QA Engineer',
                'description' => 'Ingeniero de calidad con experiencia en pruebas automatizadas.',
                'salary' => '55000',
                'location' => 'Lavalleja',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-03-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Software Architect',
                'description' => 'Arquitecto de software con experiencia en diseño de sistemas.',
                'salary' => '80000',
                'location' => 'Rocha',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-04-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'System Administrator',
                'description' => 'Administrador de sistemas con experiencia en Linux y Windows.',
                'salary' => '60000',
                'location' => 'San José',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-05-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'UI/UX Designer',
                'description' => 'Diseñador UI/UX con experiencia en Figma y Adobe XD.',
                'salary' => '50000',
                'location' => 'Soriano',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-06-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Web Developer',
                'description' => 'Desarrollador web con experiencia en HTML, CSS y JavaScript.',
                'salary' => '55000',
                'location' => 'Artigas',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-07-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Cloud Engineer',
                'description' => 'Ingeniero de nube con experiencia en AWS y Azure.',
                'salary' => '70000',
                'location' => 'Montevideo',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-08-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Blockchain Developer',
                'description' => 'Desarrollador blockchain con experiencia en Ethereum y Solidity.',
                'salary' => '80000',
                'location' => 'Canelones',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-09-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'AI Researcher',
                'description' => 'Investigador en inteligencia artificial con experiencia en aprendizaje profundo.',
                'salary' => '90000',
                'location' => 'Maldonado',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-10-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
            [
                'title' => 'Game Developer',
                'description' => 'Desarrollador de videojuegos con experiencia en Unity y Unreal Engine.',
                'salary' => '60000',
                'location' => 'Salto',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-11-30',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => false,
            ],
            [
                'title' => 'Robotics Engineer',
                'description' => 'Ingeniero en robótica con experiencia en ROS y sistemas embebidos.',
                'salary' => '85000',
                'location' => 'Paysandú',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2026-12-31',
                'postulation_way' => 'Envío de CV',
                'user_id' => $empresaUserId,
                'vacancies' => 1,
                'featured' => true,
            ],
        ]);


// Creamos un arreglo de las publicaciones posibles (de la 1 a la 25)
$all_publications = range(1, 25);

// Creamos un array donde almacenaremos todas las inserciones
$insertData = [];

// Inserción para 1 etiqueta con 25 publicaciones (esto es fijo)
for ($publication_id = 1; $publication_id <= 25; $publication_id++) {
    $insertData[] = [
        'etiqueta_id' => 1,
        'publication_id' => $publication_id,
        'created_at' => now(),
    ];
}

// Inserciones para etiquetas con entre 14 y 16 publicaciones
for ($etiqueta_id = 2; $etiqueta_id <= 15; $etiqueta_id++) {
    // Para la etiqueta 2, se asignan 16 publicaciones aleatorias; para el resto, 14 publicaciones
    $total_publicaciones = ($etiqueta_id === 2) ? 16 : 14;

    // Seleccionamos las publicaciones aleatorias para la etiqueta
    $random_publications = array_rand(array_flip($all_publications), $total_publicaciones);

    // Si $random_publications es un solo número, lo convertimos a array
    if (!is_array($random_publications)) {
        $random_publications = [$random_publications];
    }

    // Añadimos las relaciones aleatorias a $insertData
    foreach ($random_publications as $publication_id) {
        $insertData[] = [
            'etiqueta_id' => $etiqueta_id,
            'publication_id' => $publication_id,
            'created_at' => now(),
        ];
    }
}

// Finalmente, insertamos todos los datos en la base de datos de una sola vez
DB::table('contiene')->insert($insertData);

    
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