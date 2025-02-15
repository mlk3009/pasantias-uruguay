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
                    'sede' => 'Centro, Montevideo',
                    'aboutUs' => "Somos una empresa de informática dedicada a ofrecer soluciones tecnológicas innovadoras.\n\nNuestro equipo de expertos trabaja incansablemente para desarrollar software de alta calidad que satisfaga las necesidades de nuestros clientes.\n\nCreemos en la colaboración y la innovación constante para mantenernos a la vanguardia de la industria tecnológica.",
                    'desc1' => "Plataforma Colaborativa\n\nRastree el trabajo en toda la empresa a través de una plataforma abierta y colaborativa. Vincule problemas a través de Jira e ingiera datos de otras herramientas de desarrollo de software, para que sus equipos de soporte y operaciones de TI tengan información contextual más rica para responder rápidamente a solicitudes, incidentes y cambios.\n\nOfrezca excelentes experiencias de servicio rápidamente, sin la complejidad de las soluciones tradicionales de ITSM. Acelere el trabajo de desarrollo crítico, elimine el trabajo tedioso y despliegue cambios con facilidad.",
                    'desc2' => "Somos la mejor\n\nNos destacamos por nuestra dedicación y compromiso con la excelencia. Nuestro equipo está compuesto por profesionales altamente capacitados que se esfuerzan por ofrecer soluciones de calidad.\n\nNuestra misión es proporcionar servicios que superen las expectativas de nuestros clientes, asegurando su satisfacción y éxito en cada proyecto.",
                    'desc3' => "Creamos más herramientas e ideas que nos unen\n\nFlowbite te ayuda a conectarte con amigos y comunidades de personas que comparten tus intereses. Conectar con tus amigos y familiares, así como descubrir nuevos, es fácil con funciones como Grupos.",
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
                'deathline' => '2025-12-31',         'empresa_id' => $empresaUserId,
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
                
                'empresa_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Analista de Datos',
                'description' => 'Analista de datos con experiencia en SQL y Python.',
                'salary' => '35000',
                'location' => 'Salto',
                'type' => 'Full-time',
                'time' => '8:00 - 17:00',
                'deathline' => '2025-10-31',         'empresa_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Administrador de Sistemas',
                'description' => 'Administrador de sistemas con experiencia en Linux y Windows Server.',
                'salary' => '40000',
                'location' => 'Paysandú',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-09-30',         'empresa_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Especialista en Marketing Digital',
                'description' => 'Especialista en marketing digital con experiencia en SEO y SEM.',
                'salary' => '28000',
                'location' => 'Maldonado',
                'type' => 'Part-time',
                'time' => '10:00 - 14:00',
                'deathline' => '2025-08-31',         'empresa_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Ingeniero de Software',
                'description' => 'Ingeniero de software con experiencia en Java y Spring Boot.',
                'salary' => '45000',
                'location' => 'Colonia',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-07-31',         'empresa_id' => $empresaUserId,
                'vacancies' => 3, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Soporte Técnico',
                'description' => 'Soporte técnico con experiencia en hardware y software.',
                'salary' => '20000',
                'location' => 'Rivera',
                'type' => 'Part-time',
                'time' => '14:00 - 18:00',
                'deathline' => '2025-06-30',         'empresa_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Desarrollador Mobile',
                'description' => 'Desarrollador mobile con experiencia en Android y iOS.',
                'salary' => '38000',
                'location' => 'Durazno',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-05-31',         'empresa_id' => $empresaUserId,
                'vacancies' => 2, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Consultor SAP',
                'description' => 'Consultor SAP con experiencia en módulos FI y CO.',
                'salary' => '50000',
                'location' => 'San José',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-04-30',         'empresa_id' => $empresaUserId,
                'vacancies' => 1, // Agregar valor para la columna vacancies
            ],
            [
                'title' => 'Project Manager',
                'description' => 'Project manager con experiencia en metodologías ágiles.',
                'salary' => '55000',
                'location' => 'Florida',
                'type' => 'Full-time',
                'time' => '9:00 - 18:00',
                'deathline' => '2025-03-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-05-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-06-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-07-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-08-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-09-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-10-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-11-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2025-12-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-01-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-02-28',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-03-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-04-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-05-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-06-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-07-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-08-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-09-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-10-31',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-11-30',         'empresa_id' => $empresaUserId,
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
                'deathline' => '2026-12-31',         'empresa_id' => $empresaUserId,
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



// Insertar un segundo usuario empresa
DB::table('users')->insert([
    'name' => 'Segunda Empresa',
    'email' => 'segundaempresa@example.com',
    'phone' => '987654322',
    'password' => Hash::make('password'),
    'rol' => 'empresa',
    'created_at' => now(),
    'updated_at' => now(),
]);

// Obtener el ID del segundo usuario empresa recién insertado
$segundaEmpresaUserId = DB::getPdo()->lastInsertId();

// Insertar el registro en la tabla empresa para la segunda empresa
DB::table('empresa')->insert([
    'id' => $segundaEmpresaUserId,
    'sede' => 'Punta Carretas, Montevideo',
    'aboutUs' => "Somos una empresa de marketing digital que ofrece soluciones innovadoras para mejorar la presencia en línea de nuestros clientes.\n\nNuestro equipo de expertos trabaja para desarrollar estrategias efectivas que aumenten la visibilidad y el engagement en las plataformas digitales.",
    'desc1' => "Marketing Digital\n\nOfrecemos servicios de marketing digital que incluyen SEO, SEM, gestión de redes sociales y creación de contenido. Nuestro objetivo es ayudar a nuestros clientes a alcanzar sus metas de negocio a través de estrategias digitales efectivas.",
    'desc2' => "Innovación y Creatividad\n\nNos destacamos por nuestra creatividad y capacidad para innovar en el campo del marketing digital. Nuestro equipo está compuesto por profesionales apasionados que buscan constantemente nuevas formas de mejorar la presencia en línea de nuestros clientes.",
    'desc3' => "Conexión y Engagement\n\nAyudamos a nuestros clientes a conectar con su audiencia y aumentar el engagement a través de campañas de marketing digital bien diseñadas. Creemos en el poder de las redes sociales y el contenido de calidad para construir relaciones duraderas con los clientes.",
]);

// Insertar datos en la tabla publications para la segunda empresa
DB::table('publications')->insert([
    [
        'title' => 'Especialista en SEO',
        'description' => 'Especialista en SEO con experiencia en optimización de motores de búsqueda.',
        'salary' => '40000',
        'location' => 'Montevideo',
        'type' => 'Full-time',
        'time' => '9:00 - 18:00',
        'deathline' => '2025-12-31',
        'empresa_id' => $segundaEmpresaUserId,
        'vacancies' => 2,
    ],
    [
        'title' => 'Community Manager',
        'description' => 'Community Manager con experiencia en gestión de redes sociales.',
        'salary' => '30000',
        'location' => 'Canelones',
        'type' => 'Part-time',
        'time' => '10:00 - 14:00',
        'deathline' => '2025-11-30',
        
        'empresa_id' => $segundaEmpresaUserId,
        'vacancies' => 1,
    ],
    [
        'title' => 'Content Creator',
        'description' => 'Creador de contenido con experiencia en redacción y creación de videos.',
        'salary' => '35000',
        'location' => 'Salto',
        'type' => 'Full-time',
        'time' => '8:00 - 17:00',
        'deathline' => '2025-10-31', 
        'empresa_id' => $segundaEmpresaUserId,
        'vacancies' => 3,
    ],
]);

// Obtener los IDs de las publicaciones recién insertadas
$publications = DB::table('publications')->where('empresa_id', $segundaEmpresaUserId)->pluck('id');

// Insertar relaciones en la tabla contiene para las publicaciones de la segunda empresa
foreach ($publications as $publicationId) {
    $etiquetas = array_rand(array_flip(range(1, 15)), 2); // Seleccionar 2 etiquetas aleatorias entre 1 y 15
    foreach ($etiquetas as $etiquetaId) {
        DB::table('contiene')->insert([
            'etiqueta_id' => $etiquetaId,
            'publication_id' => $publicationId,
            'created_at' => now(),
        ]);
    }
}

    



        DB::table('users')->insert([
            'name' => 'Admin Ejemplo',
            'email' => 'admin@example.com',
            'phone' => '099088077',
            'password' => Hash::make('password'),
            'rol' => 'administrador',
            'created_at' => now(),
            'updated_at' => now(),
        ]);


        $adminUserId = DB::getPdo()->lastInsertId();


        DB::table('administrador')->insert([
            'ci_admin' => '55173448',
            'id' => $adminUserId,
        ]);




                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo2',
                    'email' => 'estudiante2@example.com',
                    'phone' => '123156789',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '16345678',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);



                                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo3',
                    'email' => 'estudiante3@example.com',
                    'phone' => '123455589',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '33345678',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);

                                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo4',
                    'email' => 'estudiante4@example.com',
                    'phone' => '123499989',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '77775678',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);

                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo5',
                    'email' => 'estudiante5@example.com',
                    'phone' => '112126789',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '12111178',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);


                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo6',
                    'email' => 'estudiante6@example.com',
                    'phone' => '123121282',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '12344978',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);




                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo7',
                    'email' => 'estudiante7@example.com',
                    'phone' => '123456421',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '15865678',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
                ]);

                // Insertar un usuario estudiante
                DB::table('users')->insert([
                    'name' => 'Estudiante Ejemplo8',
                    'email' => 'estudiante8@example.com',
                    'phone' => '665456789',
                    'password' => Hash::make('password'),
                    'rol' => 'estudiante',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        
                // Obtener el ID del usuario recién insertado
                $userId = DB::getPdo()->lastInsertId();
        
                // Insertar el estudiante asociado al usuario
                DB::table('estudiante')->insert([
                    'ci_estudiante' => '52145678',
                    'fec_nacimiento' => '2000-01-01',
                    'genero' => 'Masculino',
                    'desc1' => 'Descripción 1',
                    'desc2' => 'Descripción 2',
                    'cod_postal' => '12345',
                    'location' => 'Montevideo',
                    'id' => $userId,
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