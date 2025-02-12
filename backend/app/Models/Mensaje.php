<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    use HasFactory;

    protected $table = 'mensajes';

    protected $fillable = [
        'asunto',
        'mensaje',
        'mail',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}