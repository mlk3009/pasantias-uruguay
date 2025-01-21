<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Models\Postula;
use App\Models\Estudiante;
use App\Models\CV;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PublicationController extends Controller
{
    public function index()
    {
        $publications = Publication::all();

        if ($publications->isEmpty()) {
            $data = [
                'message' => 'No se encontraron publicaciones',
                'status' => 200
            ];
            return response()->json($data, 404);
        }
        $data = [
            'publications' => $publications,
            'status' => 200
        ];
        return response()->json($data, 200);
    }



    public function store(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'title' => 'required|string',
            'description' => 'required|string',
            'salary' => 'required|numeric',
            'location' => 'required|string',
            'type' => 'required|string',
            'time' => 'required|string',
            'deathline' => 'required|date',
            'vacancies' => 'required|numeric',
            'postulation_way' => 'required|string',
            'user_id' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error al crear la publicación',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        } else {
            $publication = Publication::create($jsonData);
            $data = [
                'publication' => $publication,
                'status' => 201
            ];
            return response()->json($data, 201);
        }
    }



    public function show($id)
    {
        $publication = Publication::find($id);
        if (!$publication) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        $data = [
            'publication' => $publication,
            'status' => 200
        ];
        return response()->json($data, 200);
    }



    public function destroy($id)
    {
        $publication = Publication::find($id);
        if (!$publication) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        $publication->delete();
        $data = [
            'message' => 'Publicación eliminada',
            'status' => 200
        ];
        return response()->json($data, 200);
    }



    public function update(Request $request, $id)
    {
        $publication = Publication::find($id);

        if (!$publication) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'title' => 'required|string',
            'description' => 'required|string',
            'salary' => 'required|numeric',
            'location' => 'required|string',
            'type' => 'required|string',
            'time' => 'required|string',
            'deathline' => 'required|date',
            'vacancies' => 'required|numeric',
            'postulation_way' => 'required|string',
            'user_id' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error al actualizar la publicación',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        } else {
            $publication->update($jsonData);
            $data = [
                'publication' => $publication,
                'status' => 200
            ];
            return response()->json($data, 200);
        }
    }



    public function updatePartial(Request $request, $id)
    {
        $publication = Publication::find($id);
        if (!$publication) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
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
            'user_id' => 'sometimes|required|numeric',
        ]);
        if ($validator->fails()) {
            $data = [
                'message' => 'Error al actualizar parcialmente la publicación',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        } else {
            $publication->update($jsonData);
            $data = [
                'publication' => $publication,
                'status' => 200
            ];
            return response()->json($data, 200);
        }
    }

    public function crearPostulacion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'publication_id' => 'required|numeric|exists:publications,id',
            'estudiante_id' => 'required|numeric|exists:estudiante,id',
            'postulation_date' => 'required|date',
            'estado' => 'in:pendiente,aprobado,rechazado'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error al crear la postulación',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        }

        $publicacion = Publication::find($request->publication_id);
        if (!$publicacion) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $estudiante = Estudiante::find($request->estudiante_id);
        if (!$estudiante) {
            $data = [
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $existingPostulacion = Postula::where('publication_id', $request->publication_id)
            ->where('estudiante_id', $request->estudiante_id)
            ->first();

        if ($existingPostulacion) {
            $data = [
                'message' => 'El estudiante ya se ha postulado a esta publicación',
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $estado = $request->input('estado', 'pendiente');

        $postulacion = Postula::create([
            'publication_id' => $request->publication_id,
            'estudiante_id' => $request->estudiante_id,
            'postulation_date' => $request->postulation_date,
            'estado' => $estado
        ]);

        $data = [
            'postulacion' => $postulacion,
            'message' => 'Postulación creada exitosamente',
            'status' => 201
        ];
        return response()->json($data, 201);
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

    public function obtenerDatosEstudiante($estudiante_id)
    {
        $estudiante = Estudiante::find($estudiante_id);
        if (!$estudiante) {
            return response()->json([
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ], 404);
        }
    
        $tiene_cv = CV::where('estudiante_id', $estudiante_id)->exists();
    
        $postulaciones = DB::table('postula')
            ->join('publications', 'postula.publication_id', '=', 'publications.id')
            ->join('users', 'publications.user_id', '=', 'users.id')
            ->where('postula.estudiante_id', $estudiante_id)
            ->select('publications.*', 'postula.postulation_date', 'postula.estado', 'users.name as empresa_name')
            ->get();
    
        $publicacionesGuardadas = DB::table('guarda')
            ->join('publications', 'guarda.publication_id', '=', 'publications.id')
            ->join('users', 'publications.user_id', '=', 'users.id')
            ->where('guarda.estudiante_id', $estudiante_id)
            ->select('publications.*', 'guarda.save_date', 'users.name as empresa_name')
            ->get();
    
        return response()->json([
            'estudiante' => $estudiante,
            'tiene_cv' => $tiene_cv,
            'postulaciones' => $postulaciones,
            'publicaciones_guardadas' => $publicacionesGuardadas,
            'status' => 200
        ], 200);
    }
}