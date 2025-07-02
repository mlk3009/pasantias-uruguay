<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PublicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las empresas
        $empresas = DB::table('users')->where('rol', 'empresa')->pluck('id');
        
        // Obtener todos los estudiantes
        $estudiantes = DB::table('users')->where('rol', 'estudiante')->pluck('id');

        // Obtener todas las etiquetas disponibles
        $etiquetas = DB::table('etiqueta')->pluck('id', 'name');

        // Títulos de trabajos variados con sus etiquetas correspondientes
        $jobTitlesWithTags = [
            'Desarrollador Web' => ['Full Stack Developer', 'Frontend Designer'],
            'Diseñador Gráfico' => ['UI/UX Designer', 'Frontend Designer'],
            'Analista de Datos' => ['Data Scientist', 'Backend Developer'],
            'Administrador de Sistemas' => ['System Administrator', 'Network Administrator'],
            'Especialista en Marketing Digital' => ['Product Manager'],
            'Ingeniero de Software' => ['Software Architect', 'Backend Developer', 'Full Stack Developer'],
            'Soporte Técnico' => ['System Administrator', 'Network Administrator'],
            'Desarrollador Mobile' => ['Mobile Developer', 'Full Stack Developer'],
            'Consultor SAP' => ['Backend Developer', 'System Administrator'],
            'Project Manager' => ['Product Manager'],
            'Backend Developer' => ['Backend Developer', 'Full Stack Developer'],
            'Frontend Developer' => ['Frontend Designer', 'UI/UX Designer'],
            'DevOps Engineer' => ['DevOps Engineer', 'System Administrator'],
            'UX/UI Designer' => ['UI/UX Designer', 'Frontend Designer'],
            'Quality Assurance' => ['QA Engineer']
        ];

        $jobTitles = array_keys($jobTitlesWithTags);

        // Ubicaciones en Uruguay
        $locations = [
            'Montevideo', 'Canelones', 'Maldonado', 'Paysandú', 'Salto',
            'Rivera', 'Colonia', 'Florida', 'Durazno', 'San José'
        ];

        // Tipos de trabajo
        $types = ['Full-time', 'Part-time'];

        // Horarios
        $schedules = [
            '9:00 - 18:00', '8:00 - 17:00', '10:00 - 19:00', 
            '14:00 - 18:00', '8:00 - 12:00', '13:00 - 17:00'
        ];

        foreach ($empresas as $empresaId) {
            // Crear 15 publicaciones por empresa
            for ($i = 1; $i <= 15; $i++) {
                // Las primeras 3 publicaciones serán destacadas
                $featured = $i <= 3;
                
                // Seleccionar un tipo de trabajo aleatorio
                $selectedJob = $jobTitles[array_rand($jobTitles)];
                $jobTitle = $selectedJob . ($i > count($jobTitles) ? ' ' . ($i - count($jobTitles)) : '');
                
                $publicationId = DB::table('publications')->insertGetId([
                    'title' => $jobTitle,
                    'description' => "Descripción detallada del puesto de " . $selectedJob . ". Buscamos profesionales con experiencia y ganas de crecer en un ambiente dinámico.",
                    'description2' => "Requisitos: Experiencia previa, conocimientos técnicos específicos y habilidades de comunicación.",
                    'description3' => "Ofrecemos: Excelente ambiente laboral, oportunidades de crecimiento y beneficios competitivos.",
                    'salary' => rand(25000, 80000),
                    'location' => $locations[array_rand($locations)],
                    'type' => $types[array_rand($types)],
                    'time' => $schedules[array_rand($schedules)],
                    'vacancies' => rand(1, 5),
                    'deathline' => now()->addDays(rand(30, 90))->format('Y-m-d'),
                    'is_deleted' => false,
                    'empresa_id' => $empresaId,
                    'featured' => $featured,
                    'visitas' => 0, // Inicializamos en 0, se actualizará con las visitas reales
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now(),
                ]);

                // Asignar etiquetas a la publicación (1-3 etiquetas)
                $possibleTags = $jobTitlesWithTags[$selectedJob];
                $numTags = rand(1, min(3, count($possibleTags))); // Entre 1 y 3, pero no más de las disponibles
                $selectedTags = array_rand(array_flip($possibleTags), $numTags);
                
                // Si solo se selecciona una etiqueta, array_rand devuelve un string, no un array
                if (!is_array($selectedTags)) {
                    $selectedTags = [$selectedTags];
                }
                
                foreach ($selectedTags as $tagName) {
                    if (isset($etiquetas[$tagName])) {
                        DB::table('contiene')->insert([
                            'etiqueta_id' => $etiquetas[$tagName],
                            'publication_id' => $publicationId,
                            'created_at' => now(),
                        ]);
                    }
                }

                // Generar visitas para esta publicación (30-190 visitas)
                $numVisitas = rand(30, 190);
                
                for ($j = 0; $j < $numVisitas; $j++) {
                    // Seleccionar un estudiante aleatorio
                    $estudianteId = $estudiantes[array_rand($estudiantes->toArray())];
                    
                    // Generar fecha de visita aleatoria en los últimos 30 días
                    $visitedAt = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
                    
                    DB::table('publication_visits')->insert([
                        'publication_id' => $publicationId,
                        'estudiante_id' => $estudianteId,
                        'visited_at' => $visitedAt,
                        'created_at' => $visitedAt,
                        'updated_at' => $visitedAt,
                    ]);
                }
                
                // Actualizar el contador de visitas en la publicación
                DB::table('publications')
                    ->where('id', $publicationId)
                    ->update(['visitas' => $numVisitas]);
            }
        }
    }
}
