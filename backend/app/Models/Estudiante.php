<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    protected $table = 'estudiante';

    protected $fillable = [
        'ci_estudiante',
        'id',
        'location',
        'fec_nacimiento',
        'cod_postal',
        'id_image'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'id');
    }

    public function etiquetas()
    {
        return $this->belongsToMany(Etiqueta::class, 'tiene', 'estudiante_id', 'etiqueta_id');
    }
}
