<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🏷️  Verificación de etiquetas en publicaciones:\n\n";

// Contar totales
$totalPublications = DB::table('publications')->count();
$totalEtiquetas = DB::table('etiqueta')->count();
$totalRelaciones = DB::table('contiene')->count();

echo "📊 Totales:\n";
echo "- Publicaciones: $totalPublications\n";
echo "- Etiquetas disponibles: $totalEtiquetas\n";
echo "- Relaciones publicación-etiqueta: $totalRelaciones\n\n";

// Mostrar ejemplos de publicaciones con sus etiquetas
echo "📋 Ejemplos de publicaciones con etiquetas:\n";
$examples = DB::table('publications')
    ->join('contiene', 'publications.id', '=', 'contiene.publication_id')
    ->join('etiqueta', 'contiene.etiqueta_id', '=', 'etiqueta.id')
    ->select('publications.title', 'etiqueta.name as etiqueta_name')
    ->limit(10)
    ->get();

foreach ($examples as $example) {
    echo "- {$example->title} → {$example->etiqueta_name}\n";
}

// Mostrar estadísticas de etiquetas por publicación
echo "\n📈 Distribución de etiquetas por publicación:\n";
$stats = DB::table('contiene')
    ->select(DB::raw('publication_id, COUNT(*) as num_etiquetas'))
    ->groupBy('publication_id')
    ->orderBy('num_etiquetas', 'desc')
    ->limit(5)
    ->get();

foreach ($stats as $stat) {
    $pubTitle = DB::table('publications')->where('id', $stat->publication_id)->value('title');
    echo "- {$pubTitle}: {$stat->num_etiquetas} etiquetas\n";
}

echo "\n✅ Verificación completada!\n";
