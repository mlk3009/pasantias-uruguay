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
                'desc3' => $empresa->desc3
            ];

            // Buscar imagen de la empresa
            $image = ImageUpload::where('empresa_id', $empresa->id)->first();
            if ($image) {
                $data['image'] = $image->image;
                $data['id_image'] = $image->id;
            }

            // Buscar archivo de la empresa
            $file = FileUpload::where('empresa_id', $empresa->id)->first();
            if ($file) {
                $data['file'] = $file->file;
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
            'about_us' => $empresa->about_us,
            'desc1' => $empresa->desc1,
            'desc2' => $empresa->desc2,
            'desc3' => $empresa->desc3
        ];

        // Buscar imagen de la empresa
        $image = ImageUpload::where('empresa_id', $empresa->id)->first();
        if ($image) {
            $data['image'] = $image->image;
        }

        // Buscar archivo de la empresa
        $file = FileUpload::where('empresa_id', $empresa->id)->first();
        if ($file) {
            $data['file'] = $file->file;
        }

        return response(['data' => $data], 200);
    }

    public function obtenerPublicaciones(Request $request, $empresaId): Response
    {
        try {
            // Obtener los parámetros de la solicitud
            $categoria = $request->input('categoria');
            $cantidad = $request->input('cantidad'); 

            $query = Publication::where('empresa_id', $empresaId);


            if (!is_null($categoria)) {
                $query->where('categoria', $categoria);
            }


            $query->orderBy('created_at', 'desc');
            $query->take((int) $cantidad);


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
}