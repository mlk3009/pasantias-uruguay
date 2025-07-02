<?php
require_once 'vendor/autoload.php';

// Cargar la aplicación Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Publication;

echo "=== VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS ===\n\n";

try {
    // Verificar el esquema de la tabla publications
    echo "--- Estructura de la tabla publications ---\n";
    $columns = DB::select("PRAGMA table_info(publications)");
    
    foreach ($columns as $column) {
        echo "Columna: {$column->name} | Tipo: {$column->type} | Nulo: " . ($column->notnull ? 'NO' : 'SÍ') . "\n";
    }
    
    echo "\n--- Algunas publicaciones de ejemplo ---\n";
    $publications = Publication::take(3)->get();
    
    foreach ($publications as $pub) {
        echo "ID: {$pub->id} | Título: {$pub->title}\n";
        // Mostrar todos los atributos
        $attributes = $pub->getAttributes();
        foreach ($attributes as $key => $value) {
            if (strpos($key, 'image') !== false) {
                echo "  {$key}: " . var_export($value, true) . "\n";
            }
        }
        echo "\n";
    }
    
    echo "--- Verificando el modelo Publication ---\n";
    $model = new Publication();
    $fillable = $model->getFillable();
    echo "Campos fillable: " . implode(', ', $fillable) . "\n";
    
    echo "\n--- Verificando relaciones ---\n";
    $pub = Publication::first();
    if ($pub) {
        echo "Publicación ID {$pub->id} tiene relación 'images': ";
        try {
            $images = $pub->images;
            echo "SÍ (" . $images->count() . " imágenes)\n";
            foreach ($images as $img) {
                echo "  - ID: {$img->id}, Archivo: {$img->image}\n";
            }
        } catch (Exception $e) {
            echo "NO - Error: " . $e->getMessage() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN ===\n";
?>
