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
        'description2',
        'description3',
        'salary',
        'location',
        'type',
        'time',
        'deathline',
        'vacancies',
        'featured',
        'is_deleted',
        'empresa_id',
        'visitas'
    ];
    
    public $timestamps = true;

    public function etiquetas()
    {
        return $this->belongsToMany(Etiqueta::class, 'contiene', 'publication_id', 'etiqueta_id');
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function images()
    {
        return $this->hasMany(ImageUpload::class, 'publication_id');
    }

    public function visits()
    {
        return $this->hasMany(PublicationVisit::class, 'publication_id');
    }

    public function postulaciones()
    {
        return $this->hasMany(Postula::class, 'publication_id');
    }
}