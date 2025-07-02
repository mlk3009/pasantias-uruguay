<?php
// Script de prueba para Tinker
// Copia y pega en Tinker: include 'test_purchase_tinker.php';

echo "🧪 INICIANDO PRUEBAS DEL SISTEMA DE COMPRA\n\n";

// Test 1: Verificar modelos y datos
echo "📊 Test 1: Verificando datos básicos...\n";

use App\Models\Saldo;
use App\Models\Empresa;
use App\Models\Necesita;
use App\Models\User;

$saldos = Saldo::all();
echo "✅ Saldos encontrados: " . $saldos->count() . "\n";

if ($saldos->count() > 0) {
    echo "📋 Primeros 3 saldos:\n";
    foreach ($saldos->take(3) as $s) {
        echo "   - {$s->type} | {$s->days} días | Pack: {$s->pack} | \${$s->precio}\n";
    }
}

$empresas = Empresa::all();
echo "✅ Empresas encontradas: " . $empresas->count() . "\n";

$usuariosEmpresa = User::where('rol', 'empresa')->get();
echo "✅ Usuarios empresa: " . $usuariosEmpresa->count() . "\n";

echo "\n";

// Test 2: Probar endpoint de saldos disponibles
echo "🔍 Test 2: Probando obtenerSaldosDisponibles...\n";

try {
    $controller = new App\Http\Controllers\Api\Users\CompanyController();
    $response = $controller->obtenerSaldosDisponibles();
    $data = json_decode($response->getContent(), true);
    
    echo "✅ Status: " . $response->getStatusCode() . "\n";
    echo "✅ Saldos devueltos: " . count($data['data']) . "\n";
    
    if (count($data['data']) > 0) {
        $ejemplo = $data['data'][0];
        echo "📋 Ejemplo: {$ejemplo['type']} - {$ejemplo['days']} días - \${$ejemplo['precio']}\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Simular compra
echo "💰 Test 3: Simulando compra...\n";

try {
    // Buscar empresa y saldo para probar
    $empresa = Empresa::first();
    $usuario = User::where('id', $empresa->id)->where('rol', 'empresa')->first();
    $saldo = Saldo::where('type', 'Normal')->where('pack', 1)->first();
    
    if (!$empresa || !$usuario || !$saldo) {
        echo "❌ No se encontraron datos necesarios para la prueba\n";
    } else {
        echo "🏢 Empresa: {$empresa->nombre} (ID: {$empresa->id})\n";
        echo "🎯 Saldo: {$saldo->type} - {$saldo->days} días - \${$saldo->precio}\n";
        
        // Verificar cantidad antes
        $necesitaAntes = Necesita::where('empresa_id', $empresa->id)
            ->where('saldo_id', $saldo->id)
            ->first();
        $cantidadAntes = $necesitaAntes ? $necesitaAntes->quantity : 0;
        echo "📊 Cantidad antes: {$cantidadAntes}\n";
        
        // Simular autenticación y compra
        Auth::login($usuario);
        
        $request = new Illuminate\Http\Request();
        $request->merge(['saldo_id' => $saldo->id]);
        
        $response = $controller->comprarSaldo($request);
        $responseData = json_decode($response->getContent(), true);
        
        echo "✅ Status: " . $response->getStatusCode() . "\n";
        echo "✅ Mensaje: " . $responseData['message'] . "\n";
        
        // Verificar cantidad después
        $necesitaDespues = Necesita::where('empresa_id', $empresa->id)
            ->where('saldo_id', $saldo->id)
            ->first();
        $cantidadDespues = $necesitaDespues ? $necesitaDespues->quantity : 0;
        echo "📊 Cantidad después: {$cantidadDespues}\n";
        echo "📈 Incremento: " . ($cantidadDespues - $cantidadAntes) . "\n";
        
        Auth::logout();
    }
} catch (Exception $e) {
    echo "❌ Error en compra: " . $e->getMessage() . "\n";
}

echo "\n🎉 PRUEBAS COMPLETADAS\n";
?>

