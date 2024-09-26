<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Habilidades extends Model
{
    use HasFactory;

    protected $table = 'habilidades';

    protected $fillable = [
        'cv_id',
        'habilidad',
        'nivel',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class);
    }
}