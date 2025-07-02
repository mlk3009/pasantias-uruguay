<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si el usuario está autenticado
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            
            // Solo actualizar si han pasado más de 5 minutos desde la última actividad
            // para evitar updates excesivos
            $lastActivity = $user->last_activity_at;
            $shouldUpdate = !$lastActivity || 
                           $lastActivity->diffInMinutes(now()) >= 5;
            
            if ($shouldUpdate) {
                // Usar query builder directo para mayor eficiencia
                // Evita cargar el modelo completo y triggers
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['last_activity_at' => now()]);
            }
        }

        return $next($request);
    }
}
