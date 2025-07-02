<?php

echo "=== Probando endpoint via HTTP ===\n";

// Datos para la prueba
$data = [
    'publication_id' => 6,
    'estudiante_id' => 1,
    'tipo_contacto' => 'personal',
    'empresa_id' => 2
];

// Configurar curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/contactar-estudiante');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Código HTTP: $httpCode\n";
echo "Respuesta: $response\n";

// Probar también contacto por web
echo "\n=== Probando contacto por web ===\n";

$data['tipo_contacto'] = 'web';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/contactar-estudiante');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Código HTTP: $httpCode\n";
echo "Respuesta: $response\n";

echo "\n=== Fin de la prueba ===\n";
