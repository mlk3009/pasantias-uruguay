<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Publication;
use App\Models\Necesita;
use App\Models\Saldo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{


    public function getAllUsers()
    {
        $users = User::whereIn('rol', ['empresa', 'estudiante', 'administrador'])->get();
        return response()->json($users, 200);
    }

    // Buscar usuarios según diferentes parámetros opcionales
    public function searchUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->has('location')) {
            $query->whereHas('estudiante', function ($q) use ($request) {
                $q->where('location', $request->location);
            })->orWhereHas('empresa', function ($q) use ($request) {
                $q->where('sede', 'like', '%' . $request->location . '%');
            });
        }

        if ($request->has('phone')) {
            $query->where('phone', 'like', '%' . $request->phone . '%');
        }

        $users = $query->get();
        return response()->json($users, 200);
    }




    public function updatePublication(Request $request, $id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $publication = Publication::find($id);
        if (!$publication) {
            return response()->json(['message' => 'Publicación no encontrada'], 404);
        }

        $jsonData = $request->json()->all();
        $validator = Validator::make($jsonData, [
            'title' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'salary' => 'sometimes|required|numeric',
            'location' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'time' => 'sometimes|required|string',
            'deathline' => 'sometimes|required|date',
            'vacancies' => 'sometimes|required|numeric',
            'postulation_way' => 'sometimes|required|string',
            'empresa_id' => 'sometimes|required|numeric',
            'saldo_id' => 'sometimes|required|numeric|exists:saldo,id',
            'id_image' => 'sometimes|array',
            'id_image.*' => 'numeric|exists:image_uploads,id',
            'featured' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error al actualizar parcialmente la publicación', 'errors' => $validator->errors()], 400);
        }

        // Obtener el saldo disponible para la empresa si se proporciona saldo_id
        if (isset($jsonData['saldo_id'])) {
            $empresaId = $jsonData['empresa_id'];
            $saldoId = $jsonData['saldo_id'];
            $necesita = Necesita::where('empresa_id', $empresaId)
                                ->where('saldo_id', $saldoId)
                                ->first();

            if (!$necesita || $necesita->quantity <= 0) {
                return response()->json(['message' => 'Saldo insuficiente para actualizar la publicación'], 400);
            }

            // Obtener el tipo de saldo
            $saldo = Saldo::find($saldoId);

            // Ajustar los atributos featured y deathline en base al saldo
            if ($saldo->type == 'Normal') {
                $jsonData['featured'] = false;
            } elseif ($saldo->type == 'Destacado') {
                $jsonData['featured'] = true;
            }

            $jsonData['deathline'] = now()->addDays($saldo->days)->toDateString();

            // Reducir el saldo disponible
            $necesita->quantity -= 1;

            if ($necesita->quantity <= 0) {
                $necesita->delete();
            } else {
                $necesita->save();
            }
        }

        // Actualizar la publicación
        $publication->update($jsonData);

        // Asociar imágenes a la publicación si se proporcionan
        if (isset($jsonData['id_image'])) {
            // Primero, desasociar las imágenes actuales
            $publication->images()->update(['publication_id' => null]);

            // Luego, asociar las nuevas imágenes
            foreach ($jsonData['id_image'] as $imageId) {
                $publication->images()->where('id', $imageId)->update(['publication_id' => $publication->id]);
            }
        }

        return response()->json(['publication' => $publication, 'status' => 200], 200);
    }




    public function destroyPublication($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $publication = Publication::find($id);
        if (!$publication) {
            return response()->json(['message' => 'Publicación no encontrada'], 404);
        }

        $publication->delete();
        return response()->json(['message' => 'Publicación eliminada', 'status' => 200], 200);
    }



    public function softDeletePublication($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $publication = Publication::find($id);
        if (!$publication) {
            return response()->json(['message' => 'Publicación no encontrada'], 404);
        }

        $publication->is_deleted = true;
        $publication->save();

        return response()->json(['message' => 'Publicación dada de baja lógicamente', 'status' => 200], 200);
    }


    public function deactivateUser($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
    
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
    
        // Alternar el estado de activación del usuario
        $user->is_active = !$user->is_active;
        $user->save();
    
        $message = $user->is_active ? 'Usuario activado' : 'Usuario desactivado';
        return response()->json(['message' => $message, 'status' => 200], 200);
    }
    
    public function deleteUser($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
    
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
    
        $user->delete();
    
        return response()->json(['message' => 'Usuario eliminado', 'status' => 200], 200);
    }
}