<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Models\Postula;
use App\Models\Guarda;
use App\Models\Estudiante;
use App\Models\Etiqueta;
use App\Models\CV;
use App\Models\Saldo;
use App\Models\Necesita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PublicationController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Obtener los parámetros de la solicitud
            $category = $request->input('category');
            $featured = $request->input('featured');
            $empresaId = $request->input('empresa_id'); // Nuevo parámetro opcional

            // Iniciar la consulta de publicaciones
            $query = Publication::query();

            // Filtrar por categoría (etiqueta) si se proporciona
            if ($category) {
                $query->whereHas('etiquetas', function ($q) use ($category) {
                    $q->where('name', $category);
                });
            }

            // Filtrar por publicaciones destacadas si se proporciona, si es true muestra solo las destacadas, si es false, todas.
            if ($featured === 'true') {
                $query->where('featured', true);
            }

            // Filtrar por empresa si se proporciona
            if ($empresaId) {
                $query->where('empresa_id', $empresaId);
            }

            // Ordenar por fecha de creación
            $query->orderBy('created_at', 'desc');

            // Ejecutar la consulta y obtener las publicaciones con sus etiquetas
            $publications = $query->with('etiquetas')->get();

            // Verificar si no se encontraron publicaciones
            if ($publications->isEmpty()) {
                $data = [
                    'message' => 'No se encontraron publicaciones',
                    'status' => 404
                ];
                return response()->json($data, 404);
            }

            // Formatear la respuesta para incluir las etiquetas
            $formattedPublications = $publications->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'title' => $publication->title,
                    'description' => $publication->description,
                    'salary' => $publication->salary,
                    'location' => $publication->location,
                    'type' => $publication->type,
                    'time' => $publication->time,
                    'deathline' => $publication->deathline,
                    'postulation_way' => $publication->postulation_way,
                    'empresa_id' => $publication->empresa_id,
                    'vacancies' => $publication->vacancies,
                    'featured' => $publication->featured,
                    'created_at' => $publication->created_at,
                    'updated_at' => $publication->updated_at,
                    'etiquetas' => $publication->etiquetas->pluck('name')
                ];
            });

            // Devolver las publicaciones encontradas
            $data = [
                'publications' => $formattedPublications,
                'status' => 200
            ];
            return response()->json($data, 200);
        } catch (\Exception $e) {
            // Manejar cualquier error que ocurra durante la consulta
            $data = [
                'message' => 'Error al obtener publicaciones',
                'error' => $e->getMessage(),
                'status' => 500
            ];
            return response()->json($data, 500);
        }
    }


    public function getTopCategories($limit = 3)
{
    $topCategories = Etiqueta::withCount(['publications' => function ($query) {
        $query->where('featured', true);
    }])
    ->orderBy('publications_count', 'desc')
    ->limit($limit)
    ->get(['id', 'name', 'publications_count']);

    return response()->json($topCategories, 200);
}



public function store(Request $request)
{
    $jsonData = $request->json()->all();

    $validator = Validator::make($jsonData, [
        'title' => 'required|string',
        'description' => 'sometimes|string',
        'description2' => 'sometimes|string',
        'description3' => 'sometimes|string',
        'salary' => 'required|numeric',
        'location' => 'required|string',
        'type' => 'required|string',
        'time' => 'required|string',
        'vacancies' => 'required|numeric',
        'postulation_way' => 'required|string',
        'empresa_id' => 'required|numeric',
        'saldo_id' => 'required|numeric|exists:saldo,id', 
        'id_image' => 'sometimes|array', 
        'id_image.*' => 'numeric|exists:image_uploads,id'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error al crear la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Obtener el saldo disponible para la empresa
    $empresaId = $jsonData['empresa_id'];
    $saldoId = $jsonData['saldo_id'];
    $necesita = Necesita::where('empresa_id', $empresaId)
                        ->where('saldo_id', $saldoId)
                        ->first();

    if (!$necesita || $necesita->quantity <= 0) {
        $data = [
            'message' => 'Saldo insuficiente para crear la publicación',
            'status' => 400
        ];
        return response()->json($data, 400);
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

    // Crear la publicación
    $publication = Publication::create($jsonData);

    // Reducir el saldo disponible
    $necesita->quantity -= 1;

    if ($necesita->quantity <= 0) {
        $necesita->delete();
    } else {
        $necesita->save();
    }

    // Asociar imágenes a la publicación si se proporcionan
    if (isset($jsonData['id_image'])) {
        foreach ($jsonData['id_image'] as $imageId) {
            DB::table('image_uploads')
                ->where('id', $imageId)
                ->update(['publication_id' => $publication->id]);
        }
    }

    $data = [
        'publication' => $publication,
        'status' => 201
    ];
    return response()->json($data, 201);
}


    public function show($id)
    {
        $publication = Publication::with(['empresa.user'])->find($id);
        if (!$publication) {
            $data = [
                'message' => 'Publicación no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
    
        $companyName = $publication->empresa->user->name;
        $companyEmail = $publication->empresa->user->email;
    
        $data = [
            'publication' => [
                'id' => $publication->id,
                'title' => $publication->title,
                'description' => $publication->description,
                'description2' => $publication->description2,
                'description3' => $publication->description3,
                'salary' => $publication->salary,
                'location' => $publication->location,
                'type' => $publication->type,
                'time' => $publication->time,
                'deathline' => $publication->deathline,
                'postulation_way' => $publication->postulation_way,
                'empresa_id' => $publication->empresa_id,
                'vacancies' => $publication->vacancies,
                'featured' => $publication->featured,
                'created_at' => $publication->created_at,
                'updated_at' => $publication->updated_at,
                'company_name' => $companyName,
                'company_email' => $companyEmail,
            ],
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

    public function softDelete($id)
    {
    $publication = Publication::find($id);
    if (!$publication) {
        $data = [
            'message' => 'Publicación no encontrada',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    $publication->is_deleted = true;
    $publication->save();

    $data = [
        'message' => 'Publicación dada de baja lógicamente',
        'status' => 200
    ];
    return response()->json($data, 200);
}

public function reactivatePublication(Request $request)
{
    $jsonData = $request->json()->all();

    $validator = Validator::make($jsonData, [
        'publication_id' => 'required|numeric|exists:publications,id',
        'empresa_id' => 'required|numeric|exists:empresa,id',
        'saldo_id' => 'required|numeric|exists:saldo,id'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error al reactivar la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Obtener la publicación
    $publication = Publication::find($jsonData['publication_id']);
    if (!$publication) {
        $data = [
            'message' => 'Publicación no encontrada',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    // Obtener el saldo disponible para la empresa
    $empresaId = $jsonData['empresa_id'];
    $saldoId = $jsonData['saldo_id'];
    $necesita = Necesita::where('empresa_id', $empresaId)
                        ->where('saldo_id', $saldoId)
                        ->first();

    if (!$necesita || $necesita->quantity <= 0) {
        $data = [
            'message' => 'Saldo insuficiente para reactivar la publicación',
            'status' => 400
        ];
        return response()->json($data, 400);
    }

    // Obtener el tipo de saldo
    $saldo = Saldo::find($saldoId);

    // Ajustar los atributos featured y deathline en base al saldo
    if ($saldo->type == 'Normal') {
        $publication->featured = false;
    } elseif ($saldo->type == 'Destacado') {
        $publication->featured = true;
    }

    $publication->deathline = now()->addDays($saldo->days)->toDateString();
    $publication->is_deleted = false; // Reactivar la publicación
    $publication->save();

    // Reducir el saldo disponible
    $necesita->quantity -= 1;

    if ($necesita->quantity <= 0) {
        $necesita->delete();
    } else {
        $necesita->save();
    }

    $data = [
        'publication' => $publication,
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
        'description' => 'sometimes|string',
        'description2' => 'sometimes|string',
        'description3' => 'sometimes|string',
        'salary' => 'required|numeric',
        'location' => 'required|string',
        'type' => 'required|string',
        'time' => 'required|string',
        'deathline' => 'required|date',
        'vacancies' => 'required|numeric',
        'postulation_way' => 'required|string',
        'empresa_id' => 'required|numeric',
        'id_image' => 'sometimes|array', 
        'id_image.*' => 'numeric|exists:image_uploads,id' 
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error al actualizar la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Actualizar la publicación
    $publication->update($jsonData);

    // Asociar imágenes a la publicación si se proporcionan
    if (isset($jsonData['id_image'])) {
        // Primero, desasociar las imágenes actuales
        DB::table('image_uploads')
            ->where('publication_id', $publication->id)
            ->update(['publication_id' => null]);

        // Luego, asociar las nuevas imágenes
        foreach ($jsonData['id_image'] as $imageId) {
            DB::table('image_uploads')
                ->where('id', $imageId)
                ->update(['publication_id' => $publication->id]);
        }
    }

    $data = [
        'publication' => $publication,
        'status' => 200
    ];
    return response()->json($data, 200);
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
        'description2' => 'sometimes|required|string',
        'description3' => 'sometimes|required|string',
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
        $data = [
            'message' => 'Error al actualizar parcialmente la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Obtener el saldo disponible para la empresa si se proporciona saldo_id
    if (isset($jsonData['saldo_id'])) {
        $empresaId = $jsonData['empresa_id'];
        $saldoId = $jsonData['saldo_id'];
        $necesita = Necesita::where('empresa_id', $empresaId)
                            ->where('saldo_id', $saldoId)
                            ->first();

        if (!$necesita || $necesita->quantity <= 0) {
            $data = [
                'message' => 'Saldo insuficiente para actualizar la publicación',
                'status' => 400
            ];
            return response()->json($data, 400);
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
        DB::table('image_uploads')
            ->where('publication_id', $publication->id)
            ->update(['publication_id' => null]);

        // Luego, asociar las nuevas imágenes
        foreach ($jsonData['id_image'] as $imageId) {
            DB::table('image_uploads')
                ->where('id', $imageId)
                ->update(['publication_id' => $publication->id]);
        }
    }

    $data = [
        'publication' => $publication,
        'status' => 200
    ];
    return response()->json($data, 200);
}



    public function crearPostulacion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'publication_id' => 'required|numeric|exists:publications,id',
            'estudiante_id' => 'required|numeric|exists:estudiante,id',
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
            'estado' => $estado
        ]);

        $data = [
            'postulacion' => $postulacion,
            'message' => 'Postulación creada exitosamente',
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    public function guardarPublicacion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'publication_id' => 'required|numeric|exists:publications,id',
            'estudiante_id' => 'required|numeric|exists:estudiante,id'
        ]);
    
        if ($validator->fails()) {
            $data = [
                'message' => 'Error al guardar la publicación',
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
    
        $existingGuarda = Guarda::where('publication_id', $request->publication_id)
            ->where('estudiante_id', $request->estudiante_id)
            ->first();
    
        if ($existingGuarda) {
            Guarda::where('publication_id', $request->publication_id)
                ->where('estudiante_id', $request->estudiante_id)
                ->delete();
            $data = [
                'message' => 'Publicación eliminada de guardados',
                'status' => 200
            ];
            return response()->json($data, 200);
        }
    
        $guarda = Guarda::create([
            'publication_id' => $request->publication_id,
            'estudiante_id' => $request->estudiante_id
        ]);
    
        $data = [
            'guarda' => $guarda,
            'message' => 'Publicación guardada exitosamente',
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
        ->join('users', 'publications.empresa_id', '=', 'users.id')
        ->where('postula.estudiante_id', $estudiante_id)
        ->select('publications.*', 'postula.created_at as postulation_date', 'postula.estado', 'users.name as empresa_name')
        ->get();
    
        $publicacionesGuardadas = DB::table('guarda')
            ->join('publications', 'guarda.publication_id', '=', 'publications.id')
            ->join('users', 'publications.empresa_id', '=', 'users.id')
            ->where('guarda.estudiante_id', $estudiante_id)
            ->select('publications.*', 'guarda.created_at as save_date', 'users.name as empresa_name')
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