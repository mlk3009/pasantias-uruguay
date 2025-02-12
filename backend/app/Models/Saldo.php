<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Saldo extends Model
{
    use HasFactory;

    protected $table = 'saldo';

    protected $fillable = [
        'type',
        'days',
    ];

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'necesita', 'saldo_id', 'empresa_id');
    }
}