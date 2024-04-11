<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerificationController extends Controller
{
    public function verify(Request $request, $id, $hash)
    {
        // Buscar el usuario por ID
        $user = DB::table('users')->find($id);

        // Verificar que el hash coincide con el correo electrónico del usuario
        if ($user && $hash == sha1($user->email)) {
            // Actualizar el atributo email_verified_at
            DB::table('users')
                ->where('id', $id)
                ->update(['email_verified_at' => now()]);

            return response()->json(['message' => 'Correo electrónico verificado con éxito.']);
        }

        return response()->json(['message' => 'Enlace de verificación no válido.']);
    }
}