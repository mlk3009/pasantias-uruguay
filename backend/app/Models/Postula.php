<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Postula extends Model
{
    use HasFactory;

    // Definir el nombre de la tabla
    protected $table = 'postula';

    // Desactivar timestamps si no los usas
    public $timestamps = false;

    // Definir los campos que se pueden asignar masivamente
    protected $fillable = [
        'publication_id',
        'estudiante_id',
        'estado',
        'postulation_date',
    ];

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