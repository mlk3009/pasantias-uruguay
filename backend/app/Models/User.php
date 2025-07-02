<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Email;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'phone',
        'is_suspended',
        'last_activity_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_activity_at' => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::updated(function ($user) {
            if ($user->isDirty('email_verified_at') && $user->email_verified_at !== null) {
                Email::where('email', $user->email)->delete();
            }
        });
    }

    public function mensajes()
    {
        return $this->hasMany(Mensaje::class);
    }

    public function estudiante()
    {
        return $this->hasOne(Estudiante::class, 'id');
    }

    public function empresa()
    {
        return $this->hasOne(Empresa::class, 'id');
    }

    public function administrador()
    {
        return $this->hasOne(Administrador::class, 'id');
    }
}