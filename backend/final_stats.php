<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Publication;
use App\Models\Postula;

echo "=== Estadísticas finales para Empresa ID 2 ===\n";

$empresaId = 2;

// Obtener estadísticas
$publicaciones = Publication::where('empresa_id', $empresaId)->get();

$totalPublicaciones = $publicaciones->count();
$totalVisitas = $publicaciones->sum('visitas');
$totalPostulaciones = Postula::whereIn('publication_id', $publicaciones->pluck('id'))->count();

// Calcular ratio de postulación
$ratioPostulacion = $totalVisitas > 0 ? round(($totalPostulaciones / $totalVisitas) * 100, 2) : 0;

echo "Total publicaciones: $totalPublicaciones\n";
echo "Total visitas: $totalVisitas\n";
echo "Total postulaciones: $totalPostulaciones\n";
echo "Ratio postulación: $ratioPostulacion%\n";

// Verificar distribución por estados
$estadosCount = Postula::whereIn('publication_id', $publicaciones->pluck('id'))
    ->select('estado', DB::raw('count(*) as total'))
    ->groupBy('estado')
    ->get();

echo "\nDistribución por estados:\n";
foreach ($estadosCount as $estado) {
    echo "- {$estado->estado}: {$estado->total}\n";
}

echo "\n=== Fin de estadísticas ===\n";
