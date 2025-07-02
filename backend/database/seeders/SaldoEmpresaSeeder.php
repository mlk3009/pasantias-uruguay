<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaldoEmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las empresas
        $empresas = DB::table('empresa')->pluck('id');
        
        // Obtener todos los tipos de saldo disponibles
        $saldos = DB::table('saldo')->get();
        
        foreach ($empresas as $empresaId) {
            // Cada empresa tendrá entre 2-4 tipos de saldo diferentes
            $numSaldos = rand(2, 4);
            
            // Seleccionar saldos aleatorios para esta empresa
            $saldosSeleccionados = $saldos->random($numSaldos);
            
            foreach ($saldosSeleccionados as $saldo) {
                // Generar cantidad basada en el tipo de saldo
                $quantity = $this->generateQuantityBySaldoType($saldo);
                
                DB::table('necesita')->insert([
                    'empresa_id' => $empresaId,
                    'saldo_id' => $saldo->id,
                    'quantity' => $quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        
        echo "✅ SaldoEmpresaSeeder completado:\n";
        echo "- " . DB::table('necesita')->count() . " asignaciones de saldo creadas\n";
        
        // Mostrar estadísticas por empresa
        $statsEmpresas = DB::table('necesita')
            ->join('empresa', 'necesita.empresa_id', '=', 'empresa.id')
            ->join('users', 'empresa.id', '=', 'users.id')
            ->select('users.name as empresa_name', DB::raw('COUNT(*) as tipos_saldo'))
            ->groupBy('users.name', 'empresa.id')
            ->get();
            
        echo "- Distribución por empresa:\n";
        foreach ($statsEmpresas as $stat) {
            echo "  * {$stat->empresa_name}: {$stat->tipos_saldo} tipos de saldo\n";
        }
        
        // Mostrar estadísticas por tipo de saldo
        $statsTipos = DB::table('necesita')
            ->join('saldo', 'necesita.saldo_id', '=', 'saldo.id')
            ->select('saldo.type', DB::raw('COUNT(*) as empresas_usando'))
            ->groupBy('saldo.type')
            ->get();
            
        echo "- Uso por tipo:\n";
        foreach ($statsTipos as $stat) {
            echo "  * {$stat->type}: {$stat->empresas_usando} empresas\n";
        }
    }
    
    /**
     * Genera cantidades realistas basadas en el tipo de saldo
     */
    private function generateQuantityBySaldoType($saldo): int
    {
        // Para saldos individuales (pack = 1)
        if ($saldo->pack == 1) {
            if ($saldo->type == 'Normal') {
                return rand(1, 5); // 1-5 publicaciones normales
            } else { // Destacada
                return rand(1, 3); // 1-3 publicaciones destacadas
            }
        }
        
        // Para packs múltiples
        if ($saldo->pack <= 5) {
            return 1; // Solo 1 pack de pocos elementos
        } elseif ($saldo->pack <= 10) {
            return rand(1, 2); // 1-2 packs medianos
        } else {
            return 1; // Solo 1 pack grande
        }
    }
}
