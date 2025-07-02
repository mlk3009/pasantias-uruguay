<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostulaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las publicaciones
        $publications = DB::table('publications')->pluck('id');
        
        // Obtener todos los estudiantes
        $estudiantes = DB::table('users')->where('rol', 'estudiante')->pluck('id');

        // Estados posibles para las postulaciones
        $estados = [
            'Postulado',   // Recién postulado
            'CV Visto',    // La empresa revisó el CV
            'En proceso'   // Está en proceso de selección
        ];

        // Pesos para hacer más realistas los estados (más postulados)
        $estadosConPeso = [
            'Postulado' => 60,   // La mayoría están recién postulados
            'CV Visto' => 30,    // Algunos ya fueron revisados
            'En proceso' => 10   // Pocos están en proceso avanzado
        ];

        // Crear array ponderado de estados
        $estadosPonderados = [];
        foreach ($estadosConPeso as $estado => $peso) {
            for ($i = 0; $i < $peso; $i++) {
                $estadosPonderados[] = $estado;
            }
        }

        foreach ($publications as $publicationId) {
            // Cada publicación tendrá entre 2 y 5 postulantes
            $numPostulantes = rand(2, 5);
            
            // Seleccionar estudiantes aleatorios sin repetir para esta publicación
            $estudiantesSeleccionados = $estudiantes->random($numPostulantes);
            
            foreach ($estudiantesSeleccionados as $estudianteId) {
                // Seleccionar un estado aleatorio ponderado
                $estado = $estadosPonderados[array_rand($estadosPonderados)];
                
                // Generar fecha de postulación entre 1 y 45 días atrás
                $fechaPostulacion = now()->subDays(rand(1, 45))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
                
                DB::table('postula')->insert([
                    'publication_id' => $publicationId,
                    'estudiante_id' => $estudianteId,
                    'estado' => $estado,
                    'created_at' => $fechaPostulacion,
                    'updated_at' => $fechaPostulacion,
                ]);
            }
        }
        
        echo "✅ PostulaSeeder completado:\n";
        echo "- " . DB::table('postula')->count() . " postulaciones creadas\n";
        echo "- Distribución de estados:\n";
        
        // Mostrar estadísticas de estados
        $statsEstados = DB::table('postula')
            ->select('estado', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('estado')
            ->orderBy('cantidad', 'desc')
            ->get();
            
        foreach ($statsEstados as $stat) {
            echo "  * {$stat->estado}: {$stat->cantidad}\n";
        }
    }
}
