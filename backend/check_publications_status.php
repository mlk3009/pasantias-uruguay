<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "📋 Estado actual de publicaciones:\n\n";

// Estadísticas generales
$totalPublications = DB::table('publications')->count();
$activePublications = DB::table('publications')->where('is_deleted', false)->count();
$softDeletedPublications = DB::table('publications')->where('is_deleted', true)->count();

echo "📊 Resumen general:\n";
echo "- Total de publicaciones: $totalPublications\n";
echo "- Publicaciones activas: $activePublications\n";
echo "- Publicaciones deshabilitadas: $softDeletedPublications\n\n";

// Publicaciones por vencer pronto
$publicationsExpiringSoon = DB::table('publications')
    ->where('is_deleted', false)
    ->where('deathline', '<', now()->addDays(7))
    ->where('deathline', '>=', now())
    ->count();

echo "⏰ Publicaciones que vencen en 7 días: $publicationsExpiringSoon\n";

// Publicaciones ya vencidas pero aún no procesadas
$expiredNotProcessed = DB::table('publications')
    ->where('is_deleted', false)
    ->where('deathline', '<', now())
    ->count();

echo "🔴 Publicaciones vencidas pendientes de deshabilitar: $expiredNotProcessed\n";

// Publicaciones deshabilitadas hace más de 3 meses
$oldSoftDeleted = DB::table('publications')
    ->where('is_deleted', true)
    ->where('updated_at', '<', now()->subMonths(3))
    ->count();

echo "🗑️  Publicaciones listas para eliminar definitivamente: $oldSoftDeleted\n\n";

echo "🔧 Comandos disponibles:\n";
echo "- php artisan publications:check-expiry    (deshabilita vencidas)\n";
echo "- php artisan publications:delete-old      (elimina deshabilitadas hace 3+ meses)\n\n";

if ($expiredNotProcessed > 0) {
    echo "💡 Sugerencia: Ejecutar 'php artisan publications:check-expiry' para procesar las vencidas\n";
}

if ($oldSoftDeleted > 0) {
    echo "💡 Sugerencia: Ejecutar 'php artisan publications:delete-old' para limpiar las antiguas\n";
}

echo "\n✅ Reporte completado!\n";
