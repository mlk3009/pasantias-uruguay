<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Verificación de estados de postulaciones ===\n";

// Obtener las publicaciones de la empresa 2
$publicacionesIds = DB::table('publications')->where('empresa_id', 2)->pluck('id');

// Verificar distribución de estados
$estadosDistribucion = DB::table('postula')
    ->whereIn('publication_id', $publicacionesIds)
    ->select('estado', DB::raw('count(*) as total'))
    ->groupBy('estado')
    ->get();

echo "Distribución de estados:\n";
foreach ($estadosDistribucion as $estado) {
    echo "- {$estado->estado}: {$estado->total} postulaciones\n";
}

// Verificar distribución por estudiantes
$estudiantesDistribucion = DB::table('postula')
    ->whereIn('publication_id', $publicacionesIds)
    ->select('estudiante_id', DB::raw('count(*) as total'))
    ->groupBy('estudiante_id')
    ->get();

echo "\nDistribución por estudiantes:\n";
foreach ($estudiantesDistribucion as $estudiante) {
    echo "- Estudiante {$estudiante->estudiante_id}: {$estudiante->total} postulaciones\n";
}

// Verificar algunas postulaciones específicas
$muestras = DB::table('postula')
    ->whereIn('publication_id', $publicacionesIds)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

echo "\nMuestra de últimas 10 postulaciones:\n";
foreach ($muestras as $muestra) {
    echo "- Publicación {$muestra->publication_id}, Estudiante {$muestra->estudiante_id}, Estado: {$muestra->estado}, Fecha: {$muestra->created_at}\n";
}

echo "\n=== Fin de verificación ===\n";
