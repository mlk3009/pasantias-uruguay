<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Empresa;
use App\Models\ImageUpload;
use App\Models\FileUpload;
use App\Models\Publication;
use App\Models\Postula;
use App\Models\Necesita;
use App\Models\Saldo;
use Illuminate\Support\Facades\Validator;
use App\Models\Estudiante;
use Illuminate\Support\Facades\DB;



class CompanyController extends Controller
{
    public function companyDetails(): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $empresa = Empresa::where('id', $user->id)->first();

            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'rol' => $user->rol,
                'aboutUs' => $empresa->aboutUs,
                'desc1' => $empresa->desc1,
                'desc2' => $empresa->desc2,
                'desc3' => $empresa->desc3,
                'sede' => $empresa->sede,
            ];

            // Buscar todas las imágenes de la empresa
            $images = ImageUpload::where('empresa_id', $empresa->id)->get();
            $data['images'] = [];

            foreach ($images as $image) {
                $data['images'][] = [
                    'id' => $image->id,
                    'image' => $image->image,
                    'desc' => $image->desc,
                ];
            }

            return response(['data' => $data], 200);
        }

        return response(['data' => 'Unauthorized'], 401);
    }

    public function obtenerEmpresaByPhone($phone): Response
    {
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            return response(['message' => 'Usuario no encontrado'], 404);
        }

        $empresa = Empresa::where('id', $user->id)->first();
        if (!$empresa) {
            return response(['message' => 'Empresa no encontrada'], 404);
        }

        $data = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'aboutUs' => $empresa->aboutUs,
            'desc1' => $empresa->desc1,
            'desc2' => $empresa->desc2,
            'desc3' => $empresa->desc3
        ];

            // Buscar todas las imágenes de la empresa
            $images = ImageUpload::where('empresa_id', $empresa->id)->get();
            $data['images'] = [];

            foreach ($images as $image) {
                $data['images'][] = [
                    'id' => $image->id,
                    'image' => $image->image,
                    'desc' => $image->desc,
                ];
            }

        return response(['data' => $data], 200);
    }


    public function obtenerPublicaciones(Request $request, $empresaId): Response
    {
        try {
            // Determinar si el identificador es un teléfono o un ID de empresa
            if (preg_match('/^\d{8,9}$/', $empresaId)) {
                // Es un teléfono
                $user = User::where('phone', $empresaId)->first();
                if (!$user) {
                    return response(['message' => 'Usuario no encontrado'], 404);
                }
    
                $empresa = Empresa::where('id', $user->id)->first();
                if (!$empresa) {
                    return response(['message' => 'Empresa no encontrada'], 404);
                }
    
                $empresaId = $empresa->id;
            }
    
            // Obtener los parámetros de la solicitud
            $categoria = $request->input('categoria');
            $cantidad = $request->input('cantidad'); 
    
            $query = Publication::where('empresa_id', $empresaId);
    
            if (!is_null($categoria)) {
                $query->where('categoria', $categoria);
            }
    
            $query->orderBy('created_at', 'desc');
            
            if (!is_null($cantidad)) {
                $query->take((int) $cantidad);
            }
    
            $publicaciones = $query->get();
    
            if ($publicaciones->isEmpty()) {
                return response(['message' => 'No se encontraron publicaciones para esta empresa'], 404);
            }
    
            return response(['data' => $publicaciones], 200);
        } catch (\Exception $e) {
            return response(['message' => 'Error al obtener publicaciones', 'error' => $e->getMessage()], 500);
        }
    }

    public function obtenerPostulantes($empresaId): Response
    {
        $publicaciones = Publication::where('empresa_id', $empresaId)->pluck('id');
        $postulantes = Postula::whereIn('publication_id', $publicaciones)
            ->join('estudiante', 'postula.estudiante_id', '=', 'estudiante.id')
            ->join('users', 'estudiante.id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', 'users.phone', 'postula.publication_id', 'postula.estado', 'postula.created_at')
            ->get();

        if ($postulantes->isEmpty()) {
            return response(['message' => 'No se encontraron postulantes para las publicaciones de esta empresa'], 404);
        }

        return response(['data' => $postulantes], 200);
    }

    public function obtenerSaldo($empresaId): Response
    {
        $saldos = Necesita::with('saldo')
            ->where('empresa_id', $empresaId)
            ->get()
            ->map(function ($necesita) {
                return [
                    'type' => $necesita->saldo->type,
                    'days' => $necesita->saldo->days,
                    'pack' => $necesita->saldo->pack,
                    'precio' => $necesita->saldo->precio,
                    'quantity' => $necesita->quantity,
                ];
            });
    
        if ($saldos->isEmpty()) {
            return response(['message' => 'No se encontraron saldos para esta empresa'], 404);
        }
    
        return response(['data' => $saldos], 200);
    }

    public function aumentarSaldo(Request $request, $empresaId): Response
{
    $saldoId = $request->input('saldo_id');
    $cantidad = $request->input('cantidad');

    $saldo = Saldo::find($saldoId);

    if (!$saldo) {
        return response(['message' => 'Saldo no encontrado'], 404);
    }

    $necesita = Necesita::where('empresa_id', $empresaId)
        ->where('saldo_id', $saldoId)
        ->first();

    if ($necesita) {
        // Actualizar el quantity existente
        $necesita->quantity += $saldo->pack * $cantidad;
        $necesita->save();
    } else {
        // Crear un nuevo registro en necesita
        Necesita::create([
            'empresa_id' => $empresaId,
            'saldo_id' => $saldoId,
            'quantity' => $saldo->pack * $cantidad,
        ]);
    }

    return response(['message' => 'Saldo aumentado exitosamente'], 200);
}


public function actualizarEstadoPostulacion(Request $request, $publication_id, $estudiante_id)
{
    $validator = Validator::make($request->all(), [
        'estado' => 'required|in:aprobado,rechazado,pendiente'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error al actualizar el estado de la postulacion',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }


    $estudiante = Estudiante::find($estudiante_id);
    if (!$estudiante) {
        $data = [
            'message' => 'Estudiante no encontrado',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    $postulacion = Postula::where('publication_id', $publication_id)
        ->where('estudiante_id', $estudiante_id)
        ->first();

    if (!$postulacion) {
        $data = [
            'message' => 'Postulación no encontrada',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    DB::table('postula')
        ->where('publication_id', $publication_id)
        ->where('estudiante_id', $estudiante_id)
        ->update(['estado' => $request->input('estado')]);

    $data = [
        'message' => 'Estado de la postulación actualizado correctamente',
        'status' => 200
    ];
    return response()->json($data, 200);
}

}