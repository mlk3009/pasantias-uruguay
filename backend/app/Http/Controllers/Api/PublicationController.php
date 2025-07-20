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
use App\Models\ImageUpload;
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
            $query = Publication::where('is_deleted', false);
    
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
            $query->orderBy('featured', 'desc');
    
            // Ejecutar la consulta y obtener las publicaciones con sus etiquetas e imágenes
            $publications = $query->with(['etiquetas', 'images'])->get();
    
            // Verificar si no se encontraron publicaciones
            if ($publications->isEmpty()) {
                $data = [
                    'message' => 'No se encontraron publicaciones',
                    'status' => 404
                ];
                return response()->json($data, 404);
            }
    
            // Formatear la respuesta para incluir las etiquetas y las imágenes
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
                    'empresa_id' => $publication->empresa_id,
                    'vacancies' => $publication->vacancies,
                    'featured' => $publication->featured,
                    'created_at' => $publication->created_at,
                    'updated_at' => $publication->updated_at,
                    'etiquetas' => $publication->etiquetas->pluck('name'),
                    'image' => $publication->images->pluck('image')->first() // Obtener la primera imagen asociada
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
        'description' => 'nullable|string',
        'description2' => 'nullable|string',
        'description3' => 'nullable|string',
        'salary' => 'required|numeric',
        'location' => 'required|string',
        'type' => 'nullable|string',
        'time' => 'nullable|string',
        'vacancies' => 'required|numeric',
        'empresa_id' => 'required|numeric',
        'saldo_id' => 'required|numeric|exists:saldo,id', 
        'id_image' => 'sometimes|array', 
        'id_image.*' => 'numeric|exists:image_uploads,id',
        'etiquetas' => 'required|array|min:1|max:3', // Al menos 1 etiqueta es requerida
        'etiquetas.*' => 'numeric|exists:etiqueta,id' // Corregido: tabla se llama 'etiqueta' no 'etiquetas'
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
    $empresaId = (int) $jsonData['empresa_id'];
    $saldoId = (int) $jsonData['saldo_id'];
    $necesita = Necesita::where('empresa_id', $empresaId)
                        ->where('saldo_id', $saldoId)
                        ->first();
    
    if (!$necesita || $necesita->quantity <= 0) {
        $data = [
            'message' => 'Saldo insuficiente para crear la publicación',
            'status' => 400,
            'empresa_id' => $empresaId,
            'saldo_id' => $saldoId,
            'necesita' => $necesita
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

    // Verificar si type o time son cadenas vacías y convertirlas a null
    if (isset($jsonData['type']) && $jsonData['type'] === '') {
        $jsonData['type'] = null;
    }
    if (isset($jsonData['time']) && $jsonData['time'] === '') {
        $jsonData['time'] = null;
    }

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

    // Asociar etiquetas a la publicación si se proporcionan
    if (isset($jsonData['etiquetas']) && is_array($jsonData['etiquetas'])) {
        $publication->etiquetas()->attach($jsonData['etiquetas']);
    }

    $data = [
        'publication' => $publication,
        'status' => 201
    ];
    return response()->json($data, 201);
}


    public function show($id)
    {
        // Validar que el ID sea un entero positivo
        if (!is_numeric($id) || $id <= 0) {
            return response()->json([
                'message' => 'ID de publicación inválido',
                'status' => 400
            ], 400);
        }

        $publication = Publication::with(['empresa.user'])->find($id);
        if (!$publication || $publication->is_deleted) {
            return response()->json([
                'message' => 'Publicación no encontrada',
                'status' => 404
            ], 404);
        }
    
        $companyName = $publication->empresa->user->name;
        $companyEmail = $publication->empresa->user->email;
        $companyPhone = $publication->empresa->user->phone;

        // Obtener las imágenes asociadas a la publicación usando la relación correcta
        $images = [];
        
        // Buscar imágenes por publication_id en la tabla image_uploads
        $imageUploads = \App\Models\ImageUpload::where('publication_id', $publication->id)
            ->orderBy('id')
            ->get();
        
        foreach ($imageUploads as $image) {
            $images[] = [
                'id' => $image->id,
                'image' => $image->image,
                'desc' => $image->desc,
                'url' => 'http://localhost:8000/images/uploads/' . $image->image
            ];
        }
        
        // Si no hay imágenes, agregar la imagen por defecto
        if (empty($images)) {
            $images[] = [
                'id' => 'default',
                'image' => 'defaultPubli.jpg',
                'desc' => 'default',
                'url' => 'http://localhost:8000/images/defaultPubli.jpg'
            ];
        }

        return response()->json([
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
                'empresa_id' => $publication->empresa_id,
                'vacancies' => $publication->vacancies,
                'featured' => $publication->featured,
                'created_at' => $publication->created_at,
                'updated_at' => $publication->updated_at,
                'company_name' => $publication->empresa->user->name,
                'company_email' => $publication->empresa->user->email,
                'company_phone' => $publication->empresa->user->phone,
                'images' => $images,
                'is_deleted' => $publication->is_deleted,
            ],
            'status' => 200
        ], 200);
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
        'description' => 'nullable|string',
        'description2' => 'nullable|string',
        'description3' => 'nullable|string',
        'salary' => 'sometimes|required|numeric',
        'location' => 'sometimes|required|string',
        'type' => 'nullable|string',
        'time' => 'nullable|string',
        'vacancies' => 'sometimes|required|numeric',
        'empresa_id' => 'sometimes|required|numeric',
        'saldo_id' => 'sometimes|required|numeric|exists:saldo,id',
        'id_image' => 'sometimes|array',
        'id_image.*' => 'numeric|exists:image_uploads,id',
        'etiquetas' => 'sometimes|array|min:1|max:3', // Al menos 1 etiqueta es requerida si se envía
        'etiquetas.*' => 'numeric|exists:etiqueta,id' // Corregido: tabla se llama 'etiqueta' no 'etiquetas'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error al actualizar la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Si se proporciona saldo_id, procesar promoción
    if (isset($jsonData['saldo_id'])) {
        $empresaId = $jsonData['empresa_id'] ?? $publication->empresa_id;
        $saldoId = $jsonData['saldo_id'];
        
        $necesita = Necesita::where('empresa_id', $empresaId)
                            ->where('saldo_id', $saldoId)
                            ->first();
        
        if (!$necesita || $necesita->quantity <= 0) {
            $data = [
                'message' => 'Saldo insuficiente para la promoción',
                'status' => 400,
                'empresa_id' => $empresaId,
                'saldo_id' => $saldoId,
                'necesita' => $necesita
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

    // Verificar si type o time son cadenas vacías y convertirlas a null
    if (isset($jsonData['type']) && $jsonData['type'] === '') {
        $jsonData['type'] = null;
    }
    if (isset($jsonData['time']) && $jsonData['time'] === '') {
        $jsonData['time'] = null;
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

    // Actualizar etiquetas si se proporcionan
    if (isset($jsonData['etiquetas']) && is_array($jsonData['etiquetas'])) {
        // Desasociar etiquetas actuales y asociar las nuevas
        $publication->etiquetas()->sync($jsonData['etiquetas']);
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

        // Verificar si el usuario es estudiante basándose en su rol
        $user = \App\Models\User::find($request->estudiante_id);
        if (!$user || $user->rol !== 'estudiante') {
            $data = [
                'message' => 'Solo los estudiantes pueden postularse a publicaciones',
                'status' => 403
            ];
            return response()->json($data, 403);
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

    // Verificar si el usuario es estudiante basándose en su rol
    $user = \App\Models\User::find($request->estudiante_id);
    if (!$user || $user->rol !== 'estudiante') {
        $data = [
            'message' => 'Solo los estudiantes pueden guardar publicaciones',
            'status' => 403
        ];
        return response()->json($data, 403);
    }

    // Nuevo: Si llega el parámetro borrar en true, elimina el guardado si existe y responde
    $borrar = $request->input('borrar', false);
    if ($borrar) {
        $deleted = Guarda::where('publication_id', $request->publication_id)
            ->where('estudiante_id', $request->estudiante_id)
            ->delete();
        $data = [
            'message' => $deleted ? 'Publicación eliminada de guardados' : 'No había guardado para eliminar',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // Si ya existe, elimina (comportamiento anterior)
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

    // Si no existe y no se pidió borrar, guarda
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
        ->select('publications.*', 'postula.created_at as postulation_date', 'postula.estado', 'users.name as empresa_name', 'users.phone as empresa_phone')
        ->get();
    
        $publicacionesGuardadas = DB::table('guarda')
            ->join('publications', 'guarda.publication_id', '=', 'publications.id')
            ->join('users', 'publications.empresa_id', '=', 'users.id')
            ->where('guarda.estudiante_id', $estudiante_id)
            ->select('publications.*', 'guarda.created_at as save_date', 'users.name as empresa_name', 'users.phone as empresa_phone')
            ->get();
    
        return response()->json([
            'estudiante' => $estudiante,
            'tiene_cv' => $tiene_cv,
            'postulaciones' => $postulaciones,
            'publicaciones_guardadas' => $publicacionesGuardadas,
            'status' => 200
        ], 200);
    }
    





public function searchPublications(Request $request)
{
    try {
        $search = $request->input('search');
        $location = $request->input('location');
        $etiqueta = $request->input('etiqueta');
        $featured = $request->input('featured');
        $isDeleted = $request->input('is_deleted');
        $phone = $request->input('phone');
        $limit = $request->input('limit'); // Nuevo parámetro para limitar resultados

        $query = Publication::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhereHas('empresa.user', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            });
        }

        if ($location) {
            $query->where('location', 'like', '%' . $location . '%');
        }

        if ($etiqueta) {
            $query->whereHas('etiquetas', function ($q) use ($etiqueta) {
                $q->where('name', 'like', '%' . $etiqueta . '%');
            });
        }

        // Salario mínimo
        if ($request->filled('salary')) {
            $query->where('salary', '>=', $request->input('salary'));
        }

        // Aquí el filtro especial para featured
        if ($featured !== null) {
            $isFeatured = filter_var($featured, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isFeatured === true) {
                $query->where('featured', true);
            }
            // Si es false, no se agrega ningún where (trae todas)
        }

        if ($isDeleted !== null) {
            $query->where('is_deleted', filter_var($isDeleted, FILTER_VALIDATE_BOOLEAN));
        }

        if ($phone) {
            $query->whereHas('empresa.user', function ($q) use ($phone) {
                $q->where('phone', 'like', '%' . $phone . '%');
            });
        }

        // Aplicar límite si se proporciona
        if ($limit && is_numeric($limit) && $limit > 0) {
            $query->limit($limit);
        }

        // Ordenar por destacados primero, luego por fecha de creación
        $query->orderBy('featured', 'desc')->orderBy('created_at', 'desc');

        $publications = $query->with(['etiquetas', 'empresa.user'])->get();

        if ($publications->isEmpty()) {
            return response()->json(['message' => 'No se encontraron publicaciones', 'status' => 404], 404);
        }

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
                'empresa_id' => $publication->empresa_id,
                'vacancies' => $publication->vacancies,
                'featured' => $publication->featured,
                'created_at' => $publication->created_at,
                'updated_at' => $publication->updated_at,
                'etiquetas' => $publication->etiquetas->pluck('name'),
                'company_name' => $publication->empresa->user->name,
                'company_email' => $publication->empresa->user->email,
                'company_phone' => $publication->empresa->user->phone,
                'is_deleted' => $publication->is_deleted,
            ];
        });

        return response()->json(['publications' => $formattedPublications, 'status' => 200], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error al buscar publicaciones', 'error' => $e->getMessage(), 'status' => 500], 500);
    }
}

public function verificarPostulacion(Request $request)
{
    $validator = Validator::make($request->all(), [
        'publication_id' => 'required|numeric|exists:publications,id',
        'estudiante_id' => 'required|numeric|exists:estudiante,id'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error en los parámetros',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Verificar si el usuario existe como estudiante
    $estudiante = \App\Models\Estudiante::find($request->estudiante_id);
    if (!$estudiante) {
        $data = [
            'message' => 'Estudiante no encontrado',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    // Verificar si el usuario es estudiante basándose en su rol
    $user = \App\Models\User::find($request->estudiante_id);
    if (!$user || $user->rol !== 'estudiante') {
        $data = [
            'postulado' => false,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    $existe = Postula::where('publication_id', $request->publication_id)
        ->where('estudiante_id', $request->estudiante_id)
        ->exists();

    $data = [
        'postulado' => $existe,
        'status' => 200
    ];
    return response()->json($data, 200);
}

public function estudianteVisita(Request $request)
{
    try {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'publication_id' => 'required|exists:publications,id',
            'estudiante_id' => 'required|exists:estudiante,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        // Verificar si el usuario es estudiante basándose en su rol
        $user = \App\Models\User::find($request->estudiante_id);
        if (!$user || $user->rol !== 'estudiante') {
            return response()->json([
                'message' => 'Solo se registran visitas de estudiantes',
                'status' => 200
            ], 200);
        }

        // Verificar si el estudiante ya visitó esta publicación
        $existingVisit = \App\Models\PublicationVisit::where('publication_id', $request->publication_id)
            ->where('estudiante_id', $request->estudiante_id)
            ->first();

        if (!$existingVisit) {
            // Crear nueva visita
            \App\Models\PublicationVisit::create([
                'publication_id' => $request->publication_id,
                'estudiante_id' => $request->estudiante_id,
                'visited_at' => now()
            ]);

            // Incrementar el contador de visitas en la publicación
            $publication = Publication::find($request->publication_id);
            $publication->increment('visitas');

            return response()->json([
                'message' => 'Visita registrada exitosamente',
                'status' => 200
            ], 200);
        }

        return response()->json([
            'message' => 'Visita ya registrada previamente',
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error al registrar la visita',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}


public function getEstadisticasEmpresa(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresa,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        $empresaId = $request->empresa_id;

        // Obtener estadísticas de la empresa
        $publicaciones = Publication::where('empresa_id', $empresaId)->get();
        
        $totalPublicaciones = $publicaciones->count();
        $totalVisitas = $publicaciones->sum('visitas');
        $totalPostulaciones = Postula::whereIn('publication_id', $publicaciones->pluck('id'))->count();
        
        // Calcular CV Vistos y Contactados basándose en los estados de las postulaciones
        $publicationIds = $publicaciones->pluck('id');
        $cvVistos = Postula::whereIn('publication_id', $publicationIds)
            ->where('estado', 'CV Visto')
            ->count();
        
        $contactados = Postula::whereIn('publication_id', $publicationIds)
            ->whereIn('estado', ['Contactado', 'En proceso'])
            ->count();
        
        // Calcular ratio de postulación
        $ratioPostulacion = $totalVisitas > 0 ? round(($totalPostulaciones / $totalVisitas) * 100, 2) : 0;

        // Obtener datos de visitas por día (últimos 7 días)
        $visitasPorDia = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = now()->subDays($i)->format('Y-m-d');
            $visitas = \App\Models\PublicationVisit::whereIn('publication_id', $publicaciones->pluck('id'))
                ->whereDate('visited_at', $fecha)
                ->count();
            $visitasPorDia[] = [
                'fecha' => $fecha,
                'visitas' => $visitas
            ];
        }

        return response()->json([
            'total_publicaciones' => $totalPublicaciones,
            'total_visitas' => $totalVisitas,
            'total_postulaciones' => $totalPostulaciones,
            'cv_vistos' => $cvVistos,
            'contactados' => $contactados,
            'ratio_postulacion' => $ratioPostulacion,
            'visitas_por_dia' => $visitasPorDia,
            'status' => 200
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error al obtener estadísticas',
            'error' => $e->getMessage(),
            'status' => 500
        ], 500);
    }
}

public function verificarPublicacionGuardada(Request $request)
{
    $validator = Validator::make($request->all(), [
        'publication_id' => 'required|numeric|exists:publications,id',
        'estudiante_id' => 'required|numeric|exists:estudiante,id'
    ]);

    if ($validator->fails()) {
        $data = [
            'message' => 'Error en los parámetros',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    }

    // Verificar si el usuario existe como estudiante
    $estudiante = \App\Models\Estudiante::find($request->estudiante_id);
    if (!$estudiante) {
        $data = [
            'message' => 'Estudiante no encontrado',
            'status' => 404
        ];
        return response()->json($data, 404);
    }

    // Verificar si el usuario es estudiante basándose en su rol
    $user = \App\Models\User::find($request->estudiante_id);
    if (!$user || $user->rol !== 'estudiante') {
        $data = [
            'guardado' => false,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    $existe = Guarda::where('publication_id', $request->publication_id)
        ->where('estudiante_id', $request->estudiante_id)
        ->exists();

    $data = [
        'guardado' => $existe,
        'status' => 200
    ];
    return response()->json($data, 200);
}
}