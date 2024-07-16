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
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'id');
    }
}
