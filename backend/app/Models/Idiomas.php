<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Idiomas extends Model
{
    use HasFactory;

    protected $table = 'idiomas';

    protected $fillable = [
        'cv_id',
        'idioma',
        'nivel',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class);
    }
}