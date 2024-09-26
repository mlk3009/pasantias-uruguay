<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experiencia extends Model
{
    use HasFactory;

    protected $table = 'experiencia';

    protected $fillable = [
        'cv_id',
        'puesto',
        'empresa',
        'fecha_inicio',
        'fecha_fin',
        'descripcion',
        'referencias',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class);
    }
}