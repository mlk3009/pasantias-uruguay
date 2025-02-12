<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Estudiante;
use App\Models\Etiqueta;
use App\Models\CV;
use App\Models\ImageUpload;
use App\Models\FileUpload;


class StudentsController extends Controller
{
    

    public function AddUsertags(Request $request)
    {

        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'estudiante_id' => 'required',
            'etiqueta_id' => 'required',

        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error al agregarle la etiqueta al usuario',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        } else {
            $estudiante = Estudiante::find($jsonData['estudiante_id']);
            $etiqueta = Etiqueta::find($jsonData['etiqueta_id']);

            if ($estudiante && $etiqueta) {
                if ($estudiante->etiquetas()->where('etiqueta_id', $etiqueta->id)->exists()) {
                    $data = [
                        'message' => 'La etiqueta ya esta asignada al estudiante',
                        'status' => 409
                    ];
                    return response()->json($data, 409);
                }

                $estudiante->etiquetas()->attach($etiqueta->id);
                $data = [
                    'message' => 'Etiqueta agregada correctamente',
                    'status' => 201
                ];
                return response()->json($data, 201);
            } else {
                $data = [
                    'message' => 'Estudiante o Etiqueta no encontrados',
                    'status' => 404
                ];
                return response()->json($data, 404);
            }
        }
    }

    public function showUsertags($id)
    {
        $estudiante = Estudiante::find($id);
    
        if (!$estudiante) {
            return response()->json(0, 200);
        }
    
        $tags = $estudiante->etiquetas()->get(['id', 'name']);
        if ($tags->isEmpty()) {
            $data = [
                'message' => 'Etiquetas no encontradas',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        $data = [
            'etiquetas del estudiante' => $tags,
            'status' => 200
        ];
        return response()->json($data, 200);
    }
    
    public function deleteUserTag(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'estudiante_id' => 'required',
            'etiqueta_id' => 'required',
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error al eliminar la etiqueta del usuario',
                'status' => 400,
                'errors' => $validator->errors()
            ];
            return response()->json($data, 400);
        } else {
            $estudiante = Estudiante::find($jsonData['estudiante_id']);
            $etiqueta = Etiqueta::find($jsonData['etiqueta_id']);

            if ($estudiante && $etiqueta) {
                if (!$estudiante->etiquetas()->where('etiqueta_id', $etiqueta->id)->exists()) {
                    $data = [
                        'message' => 'La etiqueta no está asignada al estudiante',
                        'status' => 409
                    ];
                    return response()->json($data, 409);
                }

                $estudiante->etiquetas()->detach($etiqueta->id);
                $data = [
                    'message' => 'Etiqueta eliminada correctamente',
                    'status' => 200
                ];
                return response()->json($data, 200);
            } else {
                $data = [
                    'message' => 'Estudiante o Etiqueta no encontrados',
                    'status' => 404
                ];
                return response()->json($data, 404);
            }
        }
    }

    public function showTags()
    {
        $tags = Etiqueta::all();
        if (!$tags) {
            $data = [
                'message' => 'Error al mostrar las etiquetas',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        $data = [
            'Tags' => $tags,
            'status' => 200
        ];
        return response()->json($data, 200);
    }


    public function obtenerUsuarioByPhone($phone): Response
    {
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            return response(['message' => 'Usuario no encontrado'], 404);
        }

        $estudiante = Estudiante::where('id', $user->id)->first();
        if (!$estudiante) {
            return response(['message' => 'Estudiante no encontrado'], 404);
        }


        $etiquetas = $estudiante->etiquetas()->select('etiqueta.id', 'etiqueta.name')->get();
        $cv = CV::where('estudiante_id', $user->id)->first();

        $data = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'fec_nacimiento' => $estudiante->fec_nacimiento,
            'desc1' => $estudiante->desc1,
            'desc2' => $estudiante->desc2,
            'cod_postal' => $estudiante->cod_postal,
            'location' => $estudiante->location,
            'genero' => $estudiante->genero,
            'etiquetas' => $etiquetas, 
            'cv' => $cv ? $cv->pdf : null 
        ];

        // Buscar imagen del estudiante
        $image = ImageUpload::where('estudiante_id', $estudiante->id)->first();
        if ($image) {
            $data['image'] = $image->image;
        }

        // Buscar archivo del estudiante
        $file = FileUpload::where('estudiante_id', $estudiante->id)->first();
        if ($file) {
            $data['file'] = $file->file;
        }

        return response(['data' => $data], 200);
    }












}
