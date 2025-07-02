<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Publication;
use App\Models\ImageUpload;

echo "=== VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS ===\n\n";

try {
    // Verificar el esquema de la tabla publications
    echo "--- Estructura de la tabla publications ---\n";
    $columns = DB::select("DESCRIBE publications");
    
    foreach ($columns as $column) {
        echo "Columna: {$column->Field} | Tipo: {$column->Type} | Nulo: {$column->Null}\n";
    }
    
    echo "\n--- Estructura de la tabla image_uploads ---\n";
    $imageColumns = DB::select("DESCRIBE image_uploads");
    
    foreach ($imageColumns as $column) {
        echo "Columna: {$column->Field} | Tipo: {$column->Type} | Nulo: {$column->Null}\n";
    }
    
    echo "\n--- Verificando imágenes con publicación ID 3 ---\n";
    $imagesForPub3 = ImageUpload::where('publication_id', 3)->get();
    echo "Imágenes para publicación ID 3: " . $imagesForPub3->count() . "\n";
    
    foreach ($imagesForPub3 as $img) {
        echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: {$img->desc}\n";
    }
    
    echo "\n--- Verificando todas las imágenes de publicaciones ---\n";
    $pubImages = ImageUpload::whereNotNull('publication_id')->get();
    echo "Total imágenes con publication_id: " . $pubImages->count() . "\n";
    
    $imagesByPublication = $pubImages->groupBy('publication_id');
    foreach ($imagesByPublication as $pubId => $images) {
        echo "Publicación {$pubId}: {$images->count()} imágenes\n";
        foreach ($images as $img) {
            echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: {$img->desc}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN ===\n";
?>
    
    // Verificar visitas totales
    $visitasTotales = DB::table('publications')->where('empresa_id', 2)->sum('visitas');
    echo "Visitas totales en publications: " . $visitasTotales . "\n";
    
    // Verificar registros en publication_visits
    $visitasRegistros = DB::table('publication_visits')->whereIn('publication_id', $publicacionesIds)->count();
    echo "Registros en publication_visits: " . $visitasRegistros . "\n";
    
    // Verificar postulaciones
    $postulacionesCount = DB::table('postula')->whereIn('publication_id', $publicacionesIds)->count();
    echo "Postulaciones para empresa 2: " . $postulacionesCount . "\n";
    
    // Verificar si hay estudiantes
    $estudiantesCount = DB::table('estudiante')->count();
    echo "Total estudiantes en la base: " . $estudiantesCount . "\n";
}

echo "\n=== Fin de verificación ===\n";
