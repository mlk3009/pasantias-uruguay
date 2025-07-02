<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ListPromociones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'promociones:list {--empresa=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Lista todas las promociones disponibles en la tabla saldo y opcionalmente muestra el saldo de una empresa específica';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $empresaId = $this->option('empresa');

        $this->info('===================================');
        $this->info('PROMOCIONES DISPONIBLES (TABLA SALDO)');
        $this->info('===================================');

        // Obtener todas las promociones
        $promociones = DB::table('saldo')
            ->select('id', 'type', 'days', 'pack', 'precio')
            ->orderBy('type')
            ->orderBy('days')
            ->orderBy('pack')
            ->get();

        if ($promociones->isEmpty()) {
            $this->warn('No se encontraron promociones en la tabla saldo.');
            return;
        }

        // Crear tabla para mostrar promociones
        $headers = ['ID', 'Tipo', 'Días', 'Pack', 'Precio ($)'];
        $rows = [];

        foreach ($promociones as $promo) {
            $rows[] = [
                $promo->id,
                $promo->type,
                $promo->days,
                $promo->pack,
                number_format($promo->precio, 0, ',', '.')
            ];
        }

        $this->table($headers, $rows);

        // Estadísticas
        $normales = $promociones->where('type', 'Normal')->count();
        $destacadas = $promociones->where('type', 'Destacada')->count();
        
        $this->info("\nEstadísticas:");
        $this->line("- Total promociones: " . $promociones->count());
        $this->line("- Promociones Normales: $normales");
        $this->line("- Promociones Destacadas: $destacadas");

        // Si se especifica una empresa, mostrar su saldo
        if ($empresaId) {
            $this->showEmpresaSaldo($empresaId);
        }
    }

    private function showEmpresaSaldo($empresaId)
    {
        $this->info("\n===================================");
        $this->info("SALDO DE EMPRESA ID: $empresaId");
        $this->info('===================================');

        // Verificar si la empresa existe
        $empresa = DB::table('empresa')->where('id', $empresaId)->first();
        if (!$empresa) {
            $this->error("La empresa con ID $empresaId no existe.");
            return;
        }

        $this->line("Empresa: {$empresa->nombre}");

        // Obtener saldo de la empresa
        $saldos = DB::table('necesita')
            ->join('saldo', 'necesita.saldo_id', '=', 'saldo.id')
            ->where('necesita.empresa_id', $empresaId)
            ->select('saldo.type', 'saldo.days', 'saldo.pack', 'saldo.precio', 'necesita.quantity')
            ->orderBy('saldo.type')
            ->orderBy('saldo.days')
            ->get();

        if ($saldos->isEmpty()) {
            $this->warn("La empresa no tiene promociones asignadas.");
            return;
        }

        $headers = ['Tipo', 'Días', 'Pack', 'Precio ($)', 'Cantidad'];
        $rows = [];
        $totalNormales = 0;
        $totalDestacadas = 0;

        foreach ($saldos as $saldo) {
            $rows[] = [
                $saldo->type,
                $saldo->days,
                $saldo->pack,
                number_format($saldo->precio, 0, ',', '.'),
                $saldo->quantity
            ];

            if ($saldo->type === 'Normal') {
                $totalNormales += $saldo->quantity;
            } else {
                $totalDestacadas += $saldo->quantity;
            }
        }

        $this->table($headers, $rows);

        $this->info("\nResumen del saldo:");
        $this->line("- Promociones Normales: $totalNormales");
        $this->line("- Promociones Destacadas: $totalDestacadas");
        $this->line("- Total promociones: " . ($totalNormales + $totalDestacadas));
    }
}
