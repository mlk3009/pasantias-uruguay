<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    protected $table = 'publications';

    protected $fillable = [
        'title',
        'description',
        'salary',
        'location',
        'type',
        'time',
        'deathline',
        'vacancies',
        'postulation_way',
        'featured',
        'user_id'
    ];

    public function etiquetas()
    {
        return $this->belongsToMany(Etiqueta::class, 'contiene', 'publication_id', 'etiqueta_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}