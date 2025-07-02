<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\Users\CompanyController;

echo "=== Probando endpoint de contactar estudiante ===\n";

// Crear un controlador
$controller = new CompanyController();

// Crear una request simulada
$requestData = [
    'publication_id' => 1,
    'estudiante_id' => 1,
    'tipo_contacto' => 'web',
    'empresa_id' => 2
];

$request = new Request($requestData);

try {
    $response = $controller->contactarEstudiante($request);
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
