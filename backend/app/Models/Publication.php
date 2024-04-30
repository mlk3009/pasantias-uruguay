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
        'postulation_way',
        'user_id'
    ];


    public function requirements()
    {
        return $this->hasMany(Requirements::class);
    }
}