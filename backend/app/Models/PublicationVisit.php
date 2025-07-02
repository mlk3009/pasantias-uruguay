<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicationVisit extends Model
{
    use HasFactory;

    protected $table = 'publication_visits';

    protected $fillable = [
        'publication_id',
        'estudiante_id',
        'visited_at'
    ];

    protected $dates = [
        'visited_at'
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class, 'publication_id');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}
