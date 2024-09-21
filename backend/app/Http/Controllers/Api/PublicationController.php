<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Models\Postula;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PublicationController extends Controller
{
    public function index()
    {   
        // Consulta a la base de datos para obtener todas las publicaciones
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
        'postulation_way' => 'required|string',
        'user_id' => 'required|numeric'
    ]);

    if($validator->fails()) {
        $data = [
            'message' => 'Error al crear la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    } else {
        $publication = Publication::create($jsonData); // Inserción en la base de datos
        $data = [
            'publication' => $publication,
            'status' => 201
        ];
        return response()->json($data, 201);
    }
}



public function show($id)
{
    $publication = Publication::find($id); // Consulta a la base de datos para obtener una publicación
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
    $publication = Publication::find($id); // Consulta a la base de datos para obtener una publicación
    if (!$publication) {
        $data = [
            'message' => 'Publicación no encontrada',
            'status' => 404
        ];
        return response()->json($data, 404);
    }
    $publication->delete(); // Eliminación de la publicación
    $data = [
        'message' => 'Publicación eliminada',
        'status' => 200
    ];
    return response()->json($data, 200);
}



public function update(Request $request, $id)
{
    $publication = Publication::find($id); // Consulta a la base de datos para obtener una publicación

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
        'postulation_way' => 'required|string',
        'user_id' => 'required|numeric'
    ]);

    if($validator->fails()) {
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
    $publication = Publication::find($id); // Consulta a la base de datos para obtener una publicación
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
        'postulation_way' => 'sometimes|required|string',
        'user_id' => 'sometimes|required|numeric',
        ]);
    if($validator->fails()) {
        $data = [
            'message' => 'Error al actualizar parcialmente la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    } else {
        $publication->update($jsonData); // Actualización en la base de datos si los datos son correctos
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
    // Validar los datos de la solicitud
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

    // Verificar si el estudiante existe
    $estudiante = Estudiante::find($estudiante_id);
    if (!$estudiante) {
        $data = [
            'message' => 'Estudiante no encontrado',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    // Buscar la postulación en la base de datos usando la clave compuesta
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

    // Actualizar el estado de la postulación directamente usando la clave compuesta
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
