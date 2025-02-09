<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Postula extends Model
{
    use HasFactory;


    protected $table = 'postula';


    public $timestamps = true;

    // Definir los campos que se pueden asignar masivamente
    protected $fillable = [
        'publication_id',
        'estudiante_id',
        'estado'
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