<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Saldo;
use App\Models\Empresa;
use App\Models\Necesita;
use App\Models\User;
use App\Http\Controllers\Api\Users\CompanyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestPurchaseSystem extends Command
{
    protected $signature = 'test:purchase-system';
    protected $description = 'Prueba completa del sistema de compra de publicaciones';

    public function handle()
    {
        $this->info('🧪 INICIANDO PRUEBAS DEL SISTEMA DE COMPRA DE PUBLICACIONES');
        $this->newLine();

        // Test 1: Verificar datos base
        if (!$this->testBasicData()) {
            return Command::FAILURE;
        }

        // Test 2: Verificar endpoint de saldos disponibles
        if (!$this->testSaldosDisponibles()) {
            return Command::FAILURE;
        }

        // Test 3: Simular compra completa
        if (!$this->testCompraCompleta()) {
            return Command::FAILURE;
        }

        $this->newLine();
        $this->info('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
        return Command::SUCCESS;
    }

    private function testBasicData(): bool
    {
        $this->info('📊 Test 1: Verificando datos básicos...');

        // Verificar saldos
        $saldos = Saldo::all();
        if ($saldos->count() === 0) {
            $this->error('❌ No hay saldos en la base de datos');
            return false;
        }
        $this->info("✅ Saldos encontrados: {$saldos->count()}");

        // Mostrar algunos saldos
        $this->table(
            ['ID', 'Tipo', 'Días', 'Pack', 'Precio'],
            $saldos->take(5)->map(function($s) {
                return [$s->id, $s->type, $s->days, $s->pack, '$' . $s->precio];
            })->toArray()
        );

        // Verificar empresas
        $empresas = Empresa::all();
        if ($empresas->count() === 0) {
            $this->error('❌ No hay empresas en la base de datos');
            return false;
        }
        $this->info("✅ Empresas encontradas: {$empresas->count()}");

        // Verificar usuarios empresa
        $usuariosEmpresa = User::where('rol', 'empresa')->get();
        if ($usuariosEmpresa->count() === 0) {
            $this->error('❌ No hay usuarios con rol empresa');
            return false;
        }
        $this->info("✅ Usuarios empresa encontrados: {$usuariosEmpresa->count()}");

        $this->newLine();
        return true;
    }

    private function testSaldosDisponibles(): bool
    {
        $this->info('🔍 Test 2: Probando endpoint obtenerSaldosDisponibles...');

        try {
            $controller = new CompanyController();
            $response = $controller->obtenerSaldosDisponibles();
            $data = json_decode($response->getContent(), true);

            if ($response->getStatusCode() !== 200) {
                $this->error('❌ El endpoint no devuelve status 200');
                return false;
            }

            if (!isset($data['data']) || !is_array($data['data'])) {
                $this->error('❌ El endpoint no devuelve el formato esperado');
                return false;
            }

            $this->info("✅ Endpoint funciona correctamente. Saldos devueltos: " . count($data['data']));

            // Mostrar estructura de respuesta
            if (count($data['data']) > 0) {
                $ejemplo = $data['data'][0];
                $this->info("📋 Ejemplo de respuesta:");
                $this->line("   Tipo: {$ejemplo['type']}");
                $this->line("   Días: {$ejemplo['days']}");
                $this->line("   Pack: {$ejemplo['pack']}");
                $this->line("   Precio: \${$ejemplo['precio']}");
            }

        } catch (\Exception $e) {
            $this->error('❌ Error al probar endpoint: ' . $e->getMessage());
            return false;
        }

        $this->newLine();
        return true;
    }

    private function testCompraCompleta(): bool
    {
        $this->info('💰 Test 3: Simulando compra completa...');

        // Buscar una empresa para probar
        $empresa = Empresa::first();
        if (!$empresa) {
            $this->error('❌ No se encontró empresa para probar');
            return false;
        }

        // Buscar el usuario asociado a la empresa
        $usuario = User::where('id', $empresa->id)->where('rol', 'empresa')->first();
        if (!$usuario) {
            $this->error('❌ No se encontró usuario empresa para probar');
            return false;
        }

        $this->info("🏢 Usando empresa: {$empresa->nombre} (ID: {$empresa->id})");

        // Simular autenticación
        Auth::login($usuario);

        // Seleccionar un saldo para comprar
        $saldo = Saldo::where('type', 'Normal')->where('pack', 1)->where('days', 15)->first();
        if (!$saldo) {
            $this->error('❌ No se encontró saldo para probar');
            return false;
        }

        $this->info("🎯 Comprando: {$saldo->type} - {$saldo->days} días - Pack: {$saldo->pack} - \${$saldo->precio}");

        // Verificar saldo antes de la compra
        $necesitaAntes = Necesita::where('empresa_id', $empresa->id)
            ->where('saldo_id', $saldo->id)
            ->first();
        
        $cantidadAntes = $necesitaAntes ? $necesitaAntes->quantity : 0;
        $this->info("📊 Cantidad antes de compra: {$cantidadAntes}");

        try {
            // Simular request
            $request = new Request();
            $request->merge(['saldo_id' => $saldo->id]);

            // Ejecutar compra
            $controller = new CompanyController();
            $response = $controller->comprarSaldo($request);
            $responseData = json_decode($response->getContent(), true);

            if ($response->getStatusCode() !== 200) {
                $this->error('❌ Error en la compra: ' . ($responseData['message'] ?? 'Error desconocido'));
                return false;
            }

            $this->info('✅ Compra realizada exitosamente');
            $this->info("📝 Respuesta: {$responseData['message']}");

            // Verificar saldo después de la compra
            $necesitaDespues = Necesita::where('empresa_id', $empresa->id)
                ->where('saldo_id', $saldo->id)
                ->first();

            if (!$necesitaDespues) {
                $this->error('❌ No se creó registro en tabla necesita');
                return false;
            }

            $cantidadDespues = $necesitaDespues->quantity;
            $esperado = $cantidadAntes + $saldo->pack;

            if ($cantidadDespues !== $esperado) {
                $this->error("❌ Cantidad incorrecta. Esperado: {$esperado}, Obtenido: {$cantidadDespues}");
                return false;
            }

            $this->info("✅ Cantidad actualizada correctamente: {$cantidadAntes} -> {$cantidadDespues}");

            // Mostrar detalle de la compra
            $this->table(
                ['Campo', 'Valor'],
                [
                    ['Empresa ID', $empresa->id],
                    ['Saldo ID', $saldo->id],
                    ['Tipo', $saldo->type],
                    ['Días', $saldo->days],
                    ['Pack', $saldo->pack],
                    ['Precio', '$' . $saldo->precio],
                    ['Cantidad Antes', $cantidadAntes],
                    ['Cantidad Después', $cantidadDespues],
                    ['Incremento', $saldo->pack],
                ]
            );

        } catch (\Exception $e) {
            $this->error('❌ Error durante la compra: ' . $e->getMessage());
            return false;
        } finally {
            Auth::logout();
        }

        $this->newLine();
        return true;
    }
}
