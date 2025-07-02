<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Limpiar tokens expirados de Sanctum cada día
        $schedule->command('sanctum:prune-expired --hours=720')->daily(); // 30 días
        
        // Deshabilitar publicaciones vencidas cada día
        $schedule->command('publications:check-expiry')->daily();
        
        // Eliminar publicaciones deshabilitadas hace 3+ meses (cada semana)
        $schedule->command('publications:delete-old')->weekly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}