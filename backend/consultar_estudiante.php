<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Buscar postulaciones del estudiante ID 1
$postulaciones = DB::table('postula')
    ->join('publications', 'postula.publication_id', '=', 'publications.id')
    ->join('empresa', 'publications.empresa_id', '=', 'empresa.id')
    ->join('users', 'empresa.id', '=', 'users.id')
    ->where('postula.estudiante_id', 1)
    ->select('postula.*', 'publications.title as pub_title', 'publications.empresa_id', 'users.name as empresa_name')
    ->get();

echo "Postulaciones del estudiante ID 1:\n";
foreach ($postulaciones as $p) {
    echo "Publication ID: " . $p->publication_id . ", Empresa ID: " . $p->empresa_id . ", Estado: " . $p->estado . ", Título: " . $p->pub_title . ", Empresa: " . $p->empresa_name . "\n";
}

if ($postulaciones->isEmpty()) {
    echo "No se encontraron postulaciones para el estudiante ID 1\n";
} else {
    $primera = $postulaciones->first();
    echo "\nVamos a contactar al estudiante usando la primera postulación:\n";
    echo "Publication ID: " . $primera->publication_id . "\n";
    echo "Empresa ID: " . $primera->empresa_id . "\n";
}
?>
