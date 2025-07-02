// Test de postulaciones en Tinker
// Ejecutar: php artisan tinker < test_postulaciones_tinker.php

use App\Models\Publication;
use App\Models\Postula;
use App\Models\User;
use App\Models\Empresa;

echo "=== TEST POSTULACIONES EN PUBLICACIONES ===\n";

// Obtener una empresa aleatoria
$empresa = Empresa::first();

if (!$empresa) {
    echo "No se encontraron empresas en la base de datos.\n";
    exit;
}

echo "Empresa seleccionada: {$empresa->id}\n";

// Obtener publicaciones de la empresa con conteo de postulaciones
$publicaciones = Publication::where('empresa_id', $empresa->id)
    ->withCount('postulaciones')
    ->get();

echo "Publicaciones encontradas: " . $publicaciones->count() . "\n";

foreach ($publicaciones as $pub) {
    echo "ID: {$pub->id} - Título: {$pub->title}\n";
    echo "Postulaciones (withCount): {$pub->postulaciones_count}\n";
    
    // Verificar contando manualmente
    $postulacionesManual = Postula::where('publication_id', $pub->id)->count();
    echo "Postulaciones (manual): {$postulacionesManual}\n";
    
    if ($pub->postulaciones_count == $postulacionesManual) {
        echo "✓ Conteos coinciden\n";
    } else {
        echo "✗ ERROR: Los conteos no coinciden!\n";
    }
    
    echo "---\n";
}

// Test específico: obtener una publicación con postulaciones
$publicacionConPostulaciones = Publication::withCount('postulaciones')
    ->having('postulaciones_count', '>', 0)
    ->first();

if ($publicacionConPostulaciones) {
    echo "\n=== PUBLICACIÓN CON POSTULACIONES ===\n";
    echo "ID: {$publicacionConPostulaciones->id}\n";
    echo "Título: {$publicacionConPostulaciones->title}\n";
    echo "Postulaciones: {$publicacionConPostulaciones->postulaciones_count}\n";
} else {
    echo "\nNo se encontraron publicaciones con postulaciones.\n";
}

exit;
