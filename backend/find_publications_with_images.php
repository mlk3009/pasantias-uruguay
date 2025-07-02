<?php
require_once 'vendor/autoload.php';

// Cargar la aplicación Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Publication;
use App\Models\ImageUpload;

echo "=== BUSCANDO PUBLICACIONES CON IMÁGENES ===\n\n";

try {
    // Buscar todas las publicaciones que tienen id_image no nulo
    $publicationsWithImages = Publication::whereNotNull('id_image')
        ->where('id_image', '!=', '')
        ->get();
    
    echo "Publicaciones con id_image definido: " . $publicationsWithImages->count() . "\n\n";
    
    foreach ($publicationsWithImages as $pub) {
        echo "--- Publicación ID {$pub->id} ---\n";
        echo "Título: {$pub->title}\n";
        echo "id_image: " . var_export($pub->id_image, true) . "\n";
        
        $imageIds = is_array($pub->id_image) ? $pub->id_image : json_decode($pub->id_image, true);
        if ($imageIds) {
            echo "IDs decodificados: " . var_export($imageIds, true) . "\n";
            
            $images = ImageUpload::whereIn('id', $imageIds)->get();
            echo "Imágenes encontradas: " . $images->count() . "\n";
            foreach ($images as $img) {
                echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: '{$img->desc}'\n";
            }
        }
        echo "\n";
    }
    
    // Buscar la publicación más reciente
    echo "=== PUBLICACIÓN MÁS RECIENTE ===\n";
    $latestPub = Publication::orderBy('id', 'desc')->first();
    if ($latestPub) {
        echo "Publicación más reciente: ID {$latestPub->id} - {$latestPub->title}\n";
        echo "id_image: " . var_export($latestPub->id_image, true) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN ===\n";
?>
