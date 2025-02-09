<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CV extends Model
{
    use HasFactory;

    protected $table = 'cv';

    protected $fillable = [
        'estudiante_id',
        'nombre_completo',
        'fecha_nacimiento',
        'estado_civil',
        'genero',
        'licencia',
        'pdf',
        'idiomas',
    ];

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function experiencias()
    {
        return $this->hasMany(Experiencia::class);
    }

    public function educaciones()
    {
        return $this->hasMany(Educacion::class);
    }

    public function habilidades()
    {
        return $this->hasMany(Habilidades::class);
    }

    public function links()
    {
        return $this->hasMany(Links::class);
    }
}