<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etiqueta extends Model
{
    protected $table = 'etiqueta';

    protected $fillable = [
        'name',
    ];

    public $timestamps = false;

    public function estudiantes()
    {
        return $this->belongsToMany(Estudiante::class, 'tiene', 'etiqueta_id', 'estudiante_id');
    }

    public function publications()
    {
        return $this->belongsToMany(Publication::class, 'contiene', 'etiqueta_id', 'publication_id');
    }
}