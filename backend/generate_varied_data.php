<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Limpiando datos de postulaciones ===\n";

// Limpiar datos existentes
DB::table('postula')->delete();
DB::table('guarda')->delete();

echo "Datos anteriores eliminados.\n";

// Insertar nuevos datos con estados variados
$estados = ['Postulado', 'CV Visto', 'En proceso'];
$estudiantesIds = [1, 5, 6, 7, 8, 9, 10, 11]; // IDs de los estudiantes

echo "Generando nuevos datos con estados variados...\n";

for ($i = 1; $i <= 29; $i++) {
    // Generar entre 2 y 5 postulaciones por publicación
    $numPostulaciones = rand(2, 5);
    $estudiantesUsados = [];
    
    for ($j = 0; $j < $numPostulaciones; $j++) {
        // Seleccionar un estudiante que no haya sido usado para esta publicación
        do {
            $estudianteId = $estudiantesIds[array_rand($estudiantesIds)];
        } while (in_array($estudianteId, $estudiantesUsados) && count($estudiantesUsados) < count($estudiantesIds));
        
        $estudiantesUsados[] = $estudianteId;
        
        // Seleccionar un estado aleatorio
        $estado = $estados[array_rand($estados)];
        
        // Generar fecha aleatoria de los últimos 15 días
        $fechaPostulacion = now()->subDays(rand(0, 15));
        
        DB::table('postula')->insert([
            'publication_id' => $i,
            'estudiante_id' => $estudianteId,
            'estado' => $estado,
            'created_at' => $fechaPostulacion,
            'updated_at' => $fechaPostulacion,
        ]);
    }
    
    // Insertar algunos guardados
    if (rand(1, 100) <= 60) {
        $estudianteQueGuarda = $estudiantesIds[array_rand($estudiantesIds)];
        $fechaGuardado = now()->subDays(rand(0, 20));
        
        DB::table('guarda')->insert([
            'publication_id' => $i,
            'estudiante_id' => $estudianteQueGuarda,
            'created_at' => $fechaGuardado,
            'updated_at' => $fechaGuardado,
        ]);
    }
}

echo "Nuevos datos generados correctamente.\n";
echo "=== Fin de la operación ===\n";
