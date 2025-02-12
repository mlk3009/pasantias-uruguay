<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Publication;
use Carbon\Carbon;

class CheckPublicationExpiry extends Command
{
    protected $signature = 'publications:check-expiry';
    protected $description = 'Check and update the status of expired publications';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $now = Carbon::now();
        $this->info('Current time: ' . $now);

        // Obtener todas las publicaciones que no están eliminadas y cuya fecha de vencimiento ha pasado
        $publications = Publication::where('is_deleted', false)
            ->where('deathline', '<', $now)
            ->get();

        foreach ($publications as $publication) {
            $this->info('Expiring publication: ' . $publication->id . ' with deathline: ' . $publication->deathline);
            $publication->is_deleted = true;
            $publication->save();
        }

        $this->info('Expired publications have been updated.');
    }
}