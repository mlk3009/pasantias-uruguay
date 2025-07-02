<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\Users\CompanyController;

echo "=== Probando contacto con estudiante ID 1 ===\n";

// Buscar una postulación válida del estudiante ID 1
$postulacion = \App\Models\Postula::where('estudiante_id', 1)->first();

if (!$postulacion) {
    echo "No se encontró ninguna postulación del estudiante ID 1\n";
    exit;
}

echo "Postulación encontrada:\n";
echo "- Publication ID: {$postulacion->publication_id}\n";
echo "- Estudiante ID: {$postulacion->estudiante_id}\n";
echo "- Estado actual: {$postulacion->estado}\n";

// Buscar la empresa de esa publicación
$publicacion = \App\Models\Publication::find($postulacion->publication_id);
$empresaId = $publicacion->empresa_id;

echo "- Empresa ID: {$empresaId}\n\n";

// Crear el controlador
$controller = new CompanyController();

// Probar contacto personal
echo "=== Probando contacto personal ===\n";
$requestData = [
    'publication_id' => $postulacion->publication_id,
    'estudiante_id' => 1,
    'tipo_contacto' => 'personal',
    'empresa_id' => $empresaId
];

$request = new Request($requestData);

try {
    $response = $controller->contactarEstudiante($request);
    $data = $response->getData(true);
    
    echo "Respuesta del contacto personal:\n";
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Mensaje: " . $data['message'] . "\n\n";
    
} catch (\Exception $e) {
    echo "Error en contacto personal: " . $e->getMessage() . "\n\n";
}

// Probar contacto por web
echo "=== Probando contacto por web (con email) ===\n";
$requestData['tipo_contacto'] = 'web';
$request = new Request($requestData);

try {
    $response = $controller->contactarEstudiante($request);
    $data = $response->getData(true);
    
    echo "Respuesta del contacto por web:\n";
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Mensaje: " . $data['message'] . "\n";
    
} catch (\Exception $e) {
    echo "Error en contacto por web: " . $e->getMessage() . "\n";
}

echo "\n=== Fin de la prueba ===\n";
