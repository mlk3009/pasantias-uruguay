<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\PublicationController;

echo "=== PROBANDO EL MÉTODO SHOW CORREGIDO ===\n\n";

try {
    $controller = new PublicationController();
    
    echo "--- Probando con publicación ID 33 (que tiene imágenes) ---\n";
    $response33 = $controller->show(33);
    $responseData33 = $response33->getData(true);
    
    echo "Status: " . $responseData33['status'] . "\n";
    echo "Publication ID: " . $responseData33['publication']['id'] . "\n";
    echo "Title: " . $responseData33['publication']['title'] . "\n";
    echo "Images count: " . count($responseData33['publication']['images']) . "\n";
    
    foreach ($responseData33['publication']['images'] as $index => $image) {
        echo "  Image " . ($index + 1) . ": {$image['image']} (ID: {$image['id']}, Desc: {$image['desc']})\n";
    }
    
    echo "\n--- Probando con publicación ID 3 (sin imágenes) ---\n";
    $response3 = $controller->show(3);
    $responseData3 = $response3->getData(true);
    
    echo "Status: " . $responseData3['status'] . "\n";
    echo "Publication ID: " . $responseData3['publication']['id'] . "\n";
    echo "Title: " . $responseData3['publication']['title'] . "\n";
    echo "Images count: " . count($responseData3['publication']['images']) . "\n";
    
    foreach ($responseData3['publication']['images'] as $index => $image) {
        echo "  Image " . ($index + 1) . ": {$image['image']} (ID: {$image['id']}, Desc: {$image['desc']})\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN ===\n";

?>

echo "=== Probando actualización directa con DB ===\n";

try {
    // Buscar una postulación
    $postulacion = DB::table('postula')->where('estudiante_id', 1)->first();
    
    if (!$postulacion) {
        echo "No se encontró postulación\n";
        exit;
    }
    
    echo "Postulación encontrada:\n";
    echo "- Publication ID: {$postulacion->publication_id}\n";
    echo "- Estudiante ID: {$postulacion->estudiante_id}\n";
    echo "- Estado actual: {$postulacion->estado}\n";
    
    // Actualizar estado
    $updated = DB::table('postula')
        ->where('publication_id', $postulacion->publication_id)
        ->where('estudiante_id', $postulacion->estudiante_id)
        ->update(['estado' => 'En proceso']);
    
    echo "Registros actualizados: $updated\n";
    
    // Verificar actualización
    $postulacionUpdated = DB::table('postula')
        ->where('publication_id', $postulacion->publication_id)
        ->where('estudiante_id', $postulacion->estudiante_id)
        ->first();
    
    echo "Nuevo estado: {$postulacionUpdated->estado}\n";
    
    echo "\n=== Probando envío de email ===\n";
    
    // Obtener datos para el email
    $publicacion = DB::table('publications')->find($postulacion->publication_id);
    $estudiante = DB::table('estudiante')->find($postulacion->estudiante_id);
    $userEstudiante = DB::table('users')->find($estudiante->id);
    $empresa = DB::table('empresa')->find($publicacion->empresa_id);
    $userEmpresa = DB::table('users')->find($empresa->id);
    
    echo "Datos para email:\n";
    echo "- Estudiante: {$userEstudiante->name} ({$userEstudiante->email})\n";
    echo "- Empresa: {$userEmpresa->name} ({$userEmpresa->email})\n";
    echo "- Publicación: {$publicacion->title}\n";
    
    // Datos del email
    $emailData = [
        'email' => $userEmpresa->email,
        'asunto' => 'Interés en tu postulación - ' . $publicacion->title,
        'descripcion' => "Hola {$userEstudiante->name},\n\n" .
                       "La empresa {$userEmpresa->name} ha mostrado interés en tu postulación para el puesto: {$publicacion->title}.\n\n" .
                       "Nos pondremos en contacto contigo pronto para continuar con el proceso.\n\n" .
                       "Saludos,\nEquipo de Pasantías Uruguay",
        'emailDestino' => $userEstudiante->email
    ];
    
    // Enviar email
    $emailController = new \App\Http\Controllers\Api\Email\EmailController();
    $emailRequest = new \Illuminate\Http\Request($emailData);
    
    $emailResponse = $emailController->contactMe($emailRequest);
    $responseData = $emailResponse->getData(true);
    
    echo "\nResultado del email:\n";
    echo "- Status: {$emailResponse->getStatusCode()}\n";
    echo "- Mensaje: {$responseData['message']}\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Fin de la prueba ===\n";
