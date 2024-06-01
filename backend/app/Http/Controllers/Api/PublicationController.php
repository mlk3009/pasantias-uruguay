<?php
//hola yo contribuyo -_-
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        'postulation_way' => 'required|string',
        'user_id' => 'required|numeric',
        'requirements' => 'required|array',
        'requirements.*.title' => 'required|string',
        'requirements.*.level' => 'required|string'
    ]);

    if($validator->fails()) {
        $data = [
            'message' => 'Error al crear la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    } else {
        $publication = Publication::create($jsonData);
        $publication->requirements()->createMany($jsonData['requirements']);
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
        'postulation_way' => 'required|string',
        'user_id' => 'required|numeric',
        'requirements' => 'required|array',
        'requirements.*.title' => 'required|string',
        'requirements.*.level' => 'required|string'
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
        $publication->requirements()->delete();
        $publication->requirements()->createMany($jsonData['requirements']);
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
        'postulation_way' => 'sometimes|required|string',
        'user_id' => 'sometimes|required|numeric',
        'requirements' => 'sometimes|required|array',
        'requirements.*.title' => 'sometimes|required|string',
        'requirements.*.level' => 'sometimes|required|string'
    ]);

    if($validator->fails()) {
        $data = [
            'message' => 'Error al actualizar parcialmente la publicación',
            'status' => 400,
            'errors' => $validator->errors()
        ];
        return response()->json($data, 400);
    } else {
        $publication->update($jsonData);
        if (isset($jsonData['requirements'])) {
            $publication->requirements()->delete();
            $publication->requirements()->createMany($jsonData['requirements']);
        }
        $data = [
            'publication' => $publication,
            'status' => 200
        ];
        return response()->json($data, 200);
    }
}

}
