<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Educacion extends Model
{
    use HasFactory;

    protected $table = 'educacion';

    protected $fillable = [
        'cv_id',
        'nivel',
        'institucion',
        'titulo',
        'fecha_inicio',
        'fecha_fin',
        'actualmente',
        'fin_estimado',
        'descripcion',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class);
    }
}