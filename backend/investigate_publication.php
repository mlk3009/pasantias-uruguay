<?php
require_once 'vendor/autoload.php';

// Cargar la aplicación Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Usar los modelos
use App\Models\Publication;
use App\Models\ImageUpload;

echo "=== INVESTIGACIÓN DE PUBLICACIÓN ID 3 ===\n\n";

try {
    $publication = Publication::find(3);
    
    if (!$publication) {
        echo "❌ Publicación ID 3 no encontrada\n";
        exit;
    }
    
    echo "✅ Publicación encontrada:\n";
    echo "   ID: {$publication->id}\n";
    echo "   Título: {$publication->title}\n";
    echo "   id_image (raw): " . var_export($publication->id_image, true) . "\n";
    
    if ($publication->id_image) {
        echo "\n--- Procesando id_image ---\n";
        $imageIds = is_array($publication->id_image) ? $publication->id_image : json_decode($publication->id_image, true);
        echo "id_image decodificado: " . var_export($imageIds, true) . "\n";
        
        if ($imageIds && is_array($imageIds)) {
            echo "\n--- Búsqueda de imágenes con esos IDs ---\n";
            
            // Buscar TODAS las imágenes con esos IDs
            $allImages = ImageUpload::whereIn('id', $imageIds)->get();
            echo "Total imágenes encontradas con esos IDs: " . $allImages->count() . "\n";
            
            foreach ($allImages as $img) {
                echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: '{$img->desc}'\n";
            }
            
            echo "\n--- Aplicando filtros como en el controlador ---\n";
            
            // Aplicar el mismo filtro del controlador
            $filteredImages = ImageUpload::whereIn('id', $imageIds)
                ->where(function($query) {
                    $query->where('desc', 'like', 'publicationImage%')
                          ->orWhere('desc', '');
                })
                ->get();
            
            echo "Imágenes después del filtro: " . $filteredImages->count() . "\n";
            
            foreach ($filteredImages as $img) {
                echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: '{$img->desc}'\n";
            }
            
            if ($filteredImages->count() == 0) {
                echo "\n🚨 PROBLEMA IDENTIFICADO: El filtro está eliminando todas las imágenes!\n";
                
                echo "\n--- Analizando cada imagen ---\n";
                foreach ($allImages as $img) {
                    $matchesLike = stripos($img->desc, 'publicationImage') !== false;
                    $matchesEmpty = $img->desc == '';
                    echo "  - ID {$img->id}: desc='{$img->desc}' | Like publicationImage: " . ($matchesLike ? 'SÍ' : 'NO') . " | Es vacío: " . ($matchesEmpty ? 'SÍ' : 'NO') . "\n";
                }
            }
            
        } else {
            echo "❌ id_image no es un array válido\n";
        }
        
    } else {
        echo "❌ La publicación no tiene id_image definido\n";
    }
    
    echo "\n--- Búsqueda general de imágenes de publicaciones ---\n";
    $pubImages = ImageUpload::where('desc', 'like', '%publication%')->get();
    echo "Total imágenes con 'publication' en desc: " . $pubImages->count() . "\n";
    
    foreach ($pubImages as $img) {
        echo "  - ID: {$img->id}, Archivo: {$img->image}, Desc: '{$img->desc}'\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN DE INVESTIGACIÓN ===\n";
?>
