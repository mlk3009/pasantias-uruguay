<?php
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

use App\Models\Publication;
use App\Models\ImageUpload;

echo "Iniciando debug...\n";

try {
    $publication = Publication::find(3);
    
    if (!$publication) {
        echo "Publicación no encontrada\n";
        exit;
    }

echo "=== PUBLICACIÓN ID 3 ===\n";
echo "ID: " . $publication->id . "\n";
echo "Title: " . $publication->title . "\n";
echo "id_image (raw): " . var_export($publication->id_image, true) . "\n";

if ($publication->id_image) {
    $imageIds = is_array($publication->id_image) ? $publication->id_image : json_decode($publication->id_image, true);
    echo "id_image (decoded): " . var_export($imageIds, true) . "\n";
    
    if ($imageIds) {
        echo "\n=== BÚSQUEDA DE IMÁGENES ===\n";
        
        $imageUploads = ImageUpload::whereIn('id', $imageIds)
            ->where(function($query) {
                $query->where('desc', 'like', 'publicationImage%')
                      ->orWhere('desc', '');
            })
            ->orderByRaw("CAST(SUBSTRING(desc, 16) AS UNSIGNED), id")
            ->get();
        
        echo "Imágenes encontradas: " . $imageUploads->count() . "\n";
        
        foreach ($imageUploads as $image) {
            echo "- ID: {$image->id}, Image: {$image->image}, Desc: {$image->desc}\n";
        }
        
        echo "\n=== TODAS LAS IMÁGENES EN LA TABLA ===\n";
        $allImages = ImageUpload::whereIn('id', $imageIds)->get();
        echo "Total imágenes con esos IDs: " . $allImages->count() . "\n";
        
        foreach ($allImages as $image) {
            echo "- ID: {$image->id}, Image: {$image->image}, Desc: {$image->desc}\n";
        }
    }
} else {
    echo "No hay id_image definido\n";
}

echo "\n=== VERIFICACIÓN DE EXISTENCIA DE IMÁGENES ===\n";
$publicationImages = ImageUpload::where('desc', 'like', 'publication%')->get();
echo "Total imágenes con desc que contiene 'publication': " . $publicationImages->count() . "\n";

foreach ($publicationImages as $image) {
    echo "- ID: {$image->id}, Image: {$image->image}, Desc: {$image->desc}\n";
}
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
