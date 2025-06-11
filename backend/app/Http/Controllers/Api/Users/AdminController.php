<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Publication;
use App\Models\Necesita;
use App\Models\Estudiante;
use App\Models\Saldo;
use App\Models\Mensaje;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\Email\EmailController;

class AdminController extends Controller
{


    public function getAllUsers(Request $request)
    {
        $perPage = $request->input('itemsPerPage', 10);
        $page = $request->input('page', 1);
    
        $users = User::whereIn('rol', ['empresa', 'estudiante', 'administrador'])
                    ->paginate($perPage, ['*'], 'page', $page);
    
        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'total_pages' => $users->lastPage(),
            'total_users' => $users->total()
        ], 200);
    }



    public function searchUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('name')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->name . '%')
                ->orWhere('phone', 'like', '%' . $request->name . '%');
            });
        }

        if ($request->has('location')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('estudiante', function ($q) use ($request) {
                    $q->where('location', $request->location);
                })->orWhereHas('empresa', function ($q) use ($request) {
                    $q->where('sede', 'like', '%' . $request->location . '%');
                });
            });
        }

        if ($request->has('phone')) {
            $query->where('phone', 'like', '%' . $request->phone . '%');
        }

        if ($request->has('rol')) {
            $query->where('rol', $request->rol);
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
    
        $user->is_suspended = !$user->is_suspended;
        $user->save();
    
        $message = $user->is_suspended ? 'Usuario suspendido' : 'Usuario activado';
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


    public function getAllMensajes(Request $request)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
    
        $perPage = $request->input('itemsPerPage', 10);
        $page = $request->input('page', 1);
    
        $query = Mensaje::with('user');
    
        if ($request->has('solicitud') && $request->solicitud == 'true') {
            $query->where('solicitud', true);
        } else {
            $query->where('solicitud', false);
        }
    
        $mensajes = $query->paginate($perPage, ['*'], 'page', $page);
    
        return response()->json([
            'data' => $mensajes->items(),
            'current_page' => $mensajes->currentPage(),
            'total_pages' => $mensajes->lastPage(),
            'total_mensajes' => $mensajes->total()
        ], 200);
    }


    public function searchMensajes(Request $request)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
    
        $query = Mensaje::query();
    
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('asunto', 'like', '%' . $search . '%')
                ->orWhere('mensaje', 'like', '%' . $search . '%')
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('email', 'like', '%' . $search . '%');
                });
            });
        }
    
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
    
        if ($request->has('location')) {
            $query->whereHas('user.estudiante', function ($q) use ($request) {
                $q->where('location', $request->location);
            })->orWhereHas('user.empresa', function ($q) use ($request) {
                $q->where('sede', 'like', '%' . $request->location . '%');
            });
        }
    
        if ($request->has('rol')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('rol', $request->rol);
            });
        }
    
        if ($request->has('solicitud')) {
            $query->where('solicitud', filter_var($request->solicitud, FILTER_VALIDATE_BOOLEAN));
        }
    
        $mensajes = $query->with('user')->get();
        return response()->json($mensajes, 200);
    }


    public function deleteMensaje($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $mensaje = Mensaje::find($id);
        if (!$mensaje) {
            return response()->json(['message' => 'Mensaje no encontrado'], 404);
        }

        $mensaje->delete();
        return response()->json(['message' => 'Mensaje eliminado', 'status' => 200], 200);
    }



    public function approveUser($id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if ($user->is_suspended) {
            $user->is_suspended = false;
            $user->save();

            // Borrar todos los mensajes de solicitud del usuario
            Mensaje::where('user_id', $id)->where('solicitud', true)->delete();

            // Enviar correo electrónico
            $emailController = new EmailController();
            $request = new Request([
                'email' => Auth::user()->email,
                'asunto' => 'Solicitud de registro aprobada XExperiencie',
                'descripcion' => '¡Felicidades! Su empresa ha sido aprobada para formar parte de PasantíasUY. Ahora puede publicar oportunidades y conectar con talentos. ¡Bienvenidos!',
                'emailDestino' => $user->email
            ]);
            $emailController->contactMe($request);

            return response()->json(['message' => 'Usuario activado, mensajes de solicitud eliminados y correo enviado', 'status' => 200], 200);
        }

        return response()->json(['message' => 'El usuario ya está activo', 'status' => 200], 200);
    }



    public function rejectUser(Request $request, $id)
    {
        if (Auth::user()->rol !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // Borrar todos los mensajes de solicitud del usuario
        Mensaje::where('user_id', $id)->where('solicitud', true)->delete();

        // Enviar correo electrónico
        $emailController = new EmailController();
        $emailRequest = new Request([
            'email' => Auth::user()->email,
            'asunto' => 'Solicitud de registro rechazada XExperiencie',
            'descripcion' => $request->input('descripcion'),
            'emailDestino' => $user->email
        ]);
        $emailController->contactMe($emailRequest);

        $user->delete();

        return response()->json(['message' => 'Usuario rechazado, mensajes de solicitud eliminados y correo enviado', 'status' => 200], 200);
    }



}