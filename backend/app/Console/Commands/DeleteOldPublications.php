<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Publication;
use Carbon\Carbon;

class DeleteOldPublications extends Command
{
    protected $signature = 'publications:delete-old';
    protected $description = 'Delete publications that have been soft-deleted for 3 months or more';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $now = Carbon::now();
        $threeMonthsAgo = $now->copy()->subMonths(3);
        
        $this->info('Current time: ' . $now);
        $this->info('Looking for publications soft-deleted before: ' . $threeMonthsAgo);

        // Obtener publicaciones que están marcadas como eliminadas y fueron actualizadas hace 3+ meses
        $publications = Publication::where('is_deleted', true)
            ->where('updated_at', '<', $threeMonthsAgo)
            ->get();

        $deletedCount = 0;

        foreach ($publications as $publication) {
            $this->info('Permanently deleting publication: ID ' . $publication->id . 
                       ' (Title: "' . $publication->title . '")' .
                       ' - Last updated: ' . $publication->updated_at);
            
            // Eliminar definitivamente de la base de datos
            $publication->delete();
            $deletedCount++;
        }

        if ($deletedCount > 0) {
            $this->info("✅ Successfully deleted $deletedCount old publications.");
        } else {
            $this->info("ℹ️  No old publications found to delete.");
        }

        return 0;
    }
}
