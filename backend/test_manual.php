<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Probando manualmente el proceso ===\n";

try {
    // Buscar postulación
    $postulacion = \App\Models\Postula::where('estudiante_id', 1)->first();
    echo "1. Postulación encontrada: {$postulacion->id}\n";
    
    // Buscar publicación
    $publicacion = \App\Models\Publication::find($postulacion->publication_id);
    echo "2. Publicación encontrada: {$publicacion->title}\n";
    
    // Buscar estudiante
    $estudiante = \App\Models\Estudiante::find(1);
    echo "3. Estudiante encontrado: {$estudiante->id}\n";
    
    // Buscar usuario del estudiante
    $userEstudiante = \App\Models\User::find($estudiante->id);
    echo "4. Usuario estudiante: {$userEstudiante->name} - {$userEstudiante->email}\n";
    
    // Buscar empresa
    $empresa = \App\Models\Empresa::find($publicacion->empresa_id);
    echo "5. Empresa encontrada: {$empresa->id}\n";
    
    // Buscar usuario de la empresa
    $userEmpresa = \App\Models\User::find($empresa->id);
    echo "6. Usuario empresa: {$userEmpresa->name} - {$userEmpresa->email}\n";
    
    echo "\n=== Probando actualización de estado ===\n";
    
    // Actualizar estado
    $postulacion->estado = 'En proceso';
    $result = $postulacion->save();
    echo "7. Estado actualizado: " . ($result ? "Sí" : "No") . "\n";
    
    // Verificar el cambio
    $postulacionUpdated = \App\Models\Postula::find($postulacion->id);
    echo "8. Nuevo estado: {$postulacionUpdated->estado}\n";
    
    echo "\n=== Probando email ===\n";
    
    // Preparar datos del email
    $emailData = [
        'email' => $userEmpresa->email,
        'asunto' => 'Interés en tu postulación - ' . $publicacion->title,
        'descripcion' => "Hola {$userEstudiante->name}, la empresa {$userEmpresa->name} ha mostrado interés en tu postulación.",
        'emailDestino' => $userEstudiante->email
    ];
    
    echo "9. Datos del email preparados:\n";
    echo "   - Remitente: {$emailData['email']}\n";
    echo "   - Destinatario: {$emailData['emailDestino']}\n";
    echo "   - Asunto: {$emailData['asunto']}\n";
    
    // Probar envío de email
    $emailController = new \App\Http\Controllers\Api\Email\EmailController();
    $emailRequest = new \Illuminate\Http\Request($emailData);
    
    $emailResponse = $emailController->contactMe($emailRequest);
    $emailData = $emailResponse->getData(true);
    
    echo "10. Respuesta del email:\n";
    echo "    - Status: {$emailResponse->getStatusCode()}\n";
    echo "    - Mensaje: {$emailData['message']}\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
}

echo "\n=== Fin de la prueba manual ===\n";
