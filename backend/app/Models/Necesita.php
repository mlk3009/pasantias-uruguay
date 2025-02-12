<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Necesita extends Model
{
    use HasFactory;

    protected $table = 'necesita';

    protected $fillable = [
        'empresa_id',
        'saldo_id',
        'quantity'
    ];

    public $timestamps = true;

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function saldo()
    {
        return $this->belongsTo(Saldo::class);
    }
}