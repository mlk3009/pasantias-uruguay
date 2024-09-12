<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Links extends Model
{
    use HasFactory;

    protected $table = 'links';

    protected $fillable = [
        'cv_id',
        'link',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class);
    }
}