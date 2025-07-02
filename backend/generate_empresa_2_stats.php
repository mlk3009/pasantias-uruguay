<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Generando estadísticas para empresa ID 2 ===\n";

// Obtener publicaciones de la empresa ID 2
$publicaciones = DB::table('publications')->where('empresa_id', 2)->get();

if ($publicaciones->isEmpty()) {
    echo "No se encontraron publicaciones para la empresa ID 2.\n";
    echo "Creando algunas publicaciones de ejemplo...\n";
    
    // Crear algunas publicaciones de ejemplo para la empresa 2
    for ($i = 1; $i <= 5; $i++) {
        DB::table('publications')->insert([
            'title' => 'Oferta de Trabajo ' . $i . ' - Empresa 2',
            'description' => 'Descripción de la oferta de trabajo número ' . $i,
            'empresa_id' => 2,
            'salary' => rand(50000, 120000),
            'location' => 'Montevideo',
            'type' => rand(0, 1) ? 'Presencial' : 'Remoto',
            'featured' => rand(0, 1),
            'vacancies' => rand(1, 5),
            'deathline' => now()->addDays(rand(30, 90))->format('Y-m-d'),
            'created_at' => now()->subDays(rand(1, 30)),
            'updated_at' => now(),
        ]);
    }
    
    // Obtener las publicaciones recién creadas
    $publicaciones = DB::table('publications')->where('empresa_id', 2)->get();
}

echo "Encontradas " . count($publicaciones) . " publicaciones para la empresa ID 2.\n";

// Limpiar datos anteriores de postulaciones y visitas para esta empresa
$publicacionIds = $publicaciones->pluck('id')->toArray();

DB::table('postula')->whereIn('publication_id', $publicacionIds)->delete();
DB::table('guarda')->whereIn('publication_id', $publicacionIds)->delete();

// Si existe tabla de visitas, limpiarla también
if (DB::getSchemaBuilder()->hasTable('visitas')) {
    DB::table('visitas')->whereIn('publication_id', $publicacionIds)->delete();
}

echo "Datos anteriores limpiados.\n";

// Obtener IDs de estudiantes disponibles desde la base de datos
$estudiantesIds = DB::table('estudiante')->pluck('id')->toArray();
if (empty($estudiantesIds)) {
    echo "No hay estudiantes en la base de datos. No se pueden generar postulaciones.\n";
    exit(1);
}
echo "Encontrados " . count($estudiantesIds) . " estudiantes: " . implode(', ', $estudiantesIds) . "\n";

$estados = ['Postulado', 'CV Visto', 'En proceso', 'Contactado'];

$totalPostulaciones = 0;
$totalVisitas = 0;

foreach ($publicaciones as $publicacion) {
    echo "Procesando publicación ID: {$publicacion->id}\n";
    
    // Generar visitas (más visitas que postulaciones)
    $numVisitas = rand(15, 45);
    for ($i = 0; $i < $numVisitas; $i++) {
        $estudianteId = $estudiantesIds[array_rand($estudiantesIds)];
        $fechaVisita = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
        
        // Si no existe tabla de visitas, crearla o usar un método alternativo
        try {
            DB::table('visitas')->insert([
                'publication_id' => $publicacion->id,
                'estudiante_id' => $estudianteId,
                'ip_address' => '192.168.1.' . rand(1, 254),
                'created_at' => $fechaVisita,
                'updated_at' => $fechaVisita,
            ]);
        } catch (Exception $e) {
            // Si no existe la tabla visitas, crear registros en una tabla alternativa o simular
            echo "Tabla visitas no existe, simulando visitas...\n";
        }
    }
    $totalVisitas += $numVisitas;
    
    // Generar postulaciones (menos que visitas)
    $numPostulaciones = rand(3, 12);
    $estudiantesUsados = [];
    
    for ($j = 0; $j < $numPostulaciones; $j++) {
        // Seleccionar un estudiante que no haya sido usado para esta publicación
        do {
            $estudianteId = $estudiantesIds[array_rand($estudiantesIds)];
        } while (in_array($estudianteId, $estudiantesUsados) && count($estudiantesUsados) < count($estudiantesIds));
        
        $estudiantesUsados[] = $estudianteId;
        
        // Seleccionar un estado aleatorio
        $estado = $estados[array_rand($estados)];
        
        // Generar fecha aleatoria de los últimos 30 días
        $fechaPostulacion = now()->subDays(rand(0, 30))->subHours(rand(0, 23));
        
        try {
            DB::table('postula')->insert([
                'publication_id' => $publicacion->id,
                'estudiante_id' => $estudianteId,
                'estado' => $estado,
                'created_at' => $fechaPostulacion,
                'updated_at' => $fechaPostulacion,
            ]);
            $totalPostulaciones++;
        } catch (Exception $e) {
            // Si hay duplicado, continuar con el siguiente
            echo "Postulación duplicada ignorada para estudiante $estudianteId en publicación {$publicacion->id}\n";
        }
    }
    
    // Generar algunos guardados (60% de probabilidad)
    if (rand(1, 100) <= 60) {
        $estudianteQueGuarda = $estudiantesIds[array_rand($estudiantesIds)];
        $fechaGuardado = now()->subDays(rand(0, 30));
        
        try {
            DB::table('guarda')->insert([
                'publication_id' => $publicacion->id,
                'estudiante_id' => $estudianteQueGuarda,
                'created_at' => $fechaGuardado,
                'updated_at' => $fechaGuardado,
            ]);
        } catch (Exception $e) {
            // Si hay duplicado, ignorar
            echo "Guardado duplicado ignorado para estudiante $estudianteQueGuarda en publicación {$publicacion->id}\n";
        }
    }
}

echo "\n=== Resumen ===\n";
echo "Total de publicaciones procesadas: " . count($publicaciones) . "\n";
echo "Total de postulaciones generadas: {$totalPostulaciones}\n";
echo "Total de visitas generadas: {$totalVisitas}\n";
echo "Ratio de postulación: " . round(($totalPostulaciones / $totalVisitas) * 100, 2) . "%\n";
echo "\n=== Operación completada ===\n";

?>
