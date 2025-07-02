<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔐 Verificación del sistema de autenticación mejorado:\n\n";

// Verificar configuración de Sanctum
$sanctumConfig = config('sanctum.expiration');
echo "📋 Configuración de Sanctum:\n";
echo "- Expiración configurada: " . ($sanctumConfig ? "$sanctumConfig minutos (" . round($sanctumConfig / 60 / 24) . " días)" : "Sin límite") . "\n\n";

// Contar tokens activos
$totalTokens = DB::table('personal_access_tokens')->count();
$recentTokens = DB::table('personal_access_tokens')
    ->where('created_at', '>=', now()->subDays(7))
    ->count();

echo "🎫 Estado de tokens:\n";
echo "- Total de tokens en BD: $totalTokens\n";
echo "- Tokens creados última semana: $recentTokens\n\n";

// Verificar usuarios con tokens activos
$usersWithTokens = DB::table('personal_access_tokens')
    ->join('users', 'personal_access_tokens.tokenable_id', '=', 'users.id')
    ->select('users.name', 'users.email', DB::raw('COUNT(*) as token_count'))
    ->groupBy('users.id', 'users.name', 'users.email')
    ->get();

echo "👥 Usuarios con tokens activos:\n";
foreach ($usersWithTokens as $user) {
    echo "- {$user->name} ({$user->email}): {$user->token_count} tokens\n";
}

echo "\n✅ Sistema de autenticación configurado correctamente!\n";
echo "📝 Próximos pasos:\n";
echo "1. Probar login sin 'Recordarme' - debería cerrar sesión al cerrar navegador\n";
echo "2. Probar login con 'Recordarme' - debería mantener sesión por 30 días\n";
echo "3. Probar logout - debería eliminar token del servidor y cookie del navegador\n";
