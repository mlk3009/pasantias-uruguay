<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresa';

    protected $fillable = [
        'id',
        'about_us',
        'desc1',
        'desc2',
        'desc3',
        'sede'
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'id');
    }

    public function saldos()
    {
        return $this->belongsToMany(Saldo::class, 'necesita', 'empresa_id', 'saldo_id');
    }

    public function necesita()
    {
        return $this->hasMany(Necesita::class);
    }
}