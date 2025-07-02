<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\PublicationController;

echo "=== Probando API de estadísticas ===\n";

// Crear un controlador
$controller = new PublicationController();

// Crear una request simulada
$request = new Request(['empresa_id' => 2]);

try {
    $response = $controller->getEstadisticasEmpresa($request);
    $data = $response->getData(true);
    
    echo "Respuesta de la API:\n";
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Datos:\n";
    print_r($data);
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Fin de prueba ===\n";
