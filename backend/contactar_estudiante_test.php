<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CONTACTANDO AL ESTUDIANTE ID 1 ===\n\n";

// Datos para contactar al estudiante
$publication_id = 11;
$estudiante_id = 1;
$empresa_id = 2;
$tipo_contacto = 'web'; // 'personal' o 'web'

echo "Datos del contacto:\n";
echo "- Publication ID: $publication_id\n";
echo "- Estudiante ID: $estudiante_id\n"; 
echo "- Empresa ID: $empresa_id\n";
echo "- Tipo de contacto: $tipo_contacto\n\n";

try {
    // Llamar al controlador para contactar al estudiante
    $controller = new App\Http\Controllers\Api\Users\CompanyController();
    
    // Simular el request
    $request = new Illuminate\Http\Request();
    $request->merge([
        'publication_id' => $publication_id,
        'estudiante_id' => $estudiante_id,
        'empresa_id' => $empresa_id,
        'tipo_contacto' => $tipo_contacto
    ]);
    
    $response = $controller->contactarEstudiante($request);
    
    echo "Respuesta del controlador:\n";
    echo $response->getContent() . "\n";
    
    // Verificar el cambio de estado
    $postulacion = DB::table('postula')
        ->where('publication_id', $publication_id)
        ->where('estudiante_id', $estudiante_id)
        ->first();
        
    echo "\nEstado actual de la postulación: " . $postulacion->estado . "\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
