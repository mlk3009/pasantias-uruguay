<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\Users\CompanyController;
use Illuminate\Support\Facades\Validator;

echo "=== Debug del contacto con estudiante ===\n";

// Buscar una postulación válida del estudiante ID 1
$postulacion = \App\Models\Postula::where('estudiante_id', 1)->first();

if (!$postulacion) {
    echo "No se encontró ninguna postulación del estudiante ID 1\n";
    exit;
}

$publicacion = \App\Models\Publication::find($postulacion->publication_id);
$empresaId = $publicacion->empresa_id;

echo "Datos encontrados:\n";
echo "- Publication ID: {$postulacion->publication_id}\n";
echo "- Estudiante ID: {$postulacion->estudiante_id}\n";
echo "- Empresa ID: {$empresaId}\n\n";

// Verificar que existan los registros
echo "Verificando existencia de registros:\n";

$pubExists = \App\Models\Publication::find($postulacion->publication_id);
echo "- Publicación existe: " . ($pubExists ? "Sí" : "No") . "\n";

$estExists = \App\Models\Estudiante::find(1);
echo "- Estudiante existe: " . ($estExists ? "Sí" : "No") . "\n";

$empExists = \App\Models\Empresa::find($empresaId);
echo "- Empresa existe: " . ($empExists ? "Sí" : "No") . "\n";

echo "\n=== Probando validación ===\n";

$requestData = [
    'publication_id' => $postulacion->publication_id,
    'estudiante_id' => 1,
    'tipo_contacto' => 'personal',
    'empresa_id' => $empresaId
];

$validator = Validator::make($requestData, [
    'publication_id' => 'required|exists:publications,id',
    'estudiante_id' => 'required|exists:estudiante,id',
    'tipo_contacto' => 'required|in:personal,web',
    'empresa_id' => 'required|exists:empresa,id'
]);

if ($validator->fails()) {
    echo "Errores de validación:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "- $error\n";
    }
} else {
    echo "Validación exitosa\n";
}

echo "\n=== Verificando postulación específica ===\n";

$postulacionSpecific = \App\Models\Postula::where('publication_id', $postulacion->publication_id)
                                         ->where('estudiante_id', 1)
                                         ->first();

if ($postulacionSpecific) {
    echo "Postulación específica encontrada:\n";
    echo "- ID: {$postulacionSpecific->id}\n";
    echo "- Estado: {$postulacionSpecific->estado}\n";
} else {
    echo "No se encontró la postulación específica\n";
}

echo "\n=== Fin del debug ===\n";
