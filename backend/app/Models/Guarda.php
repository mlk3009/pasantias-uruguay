<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guarda extends Model
{
    use HasFactory;

    protected $table = 'guarda';

    protected $fillable = [
        'publication_id',
        'estudiante_id'
    ];

    public $timestamps = true;


        // Definir las relaciones con otros modelos
        public function publication()
        {
            return $this->belongsTo(Publication::class, 'publication_id');
        }
    
        public function estudiante()
        {
            return $this->belongsTo(Estudiante::class, 'estudiante_id');
        }
}


