<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Email;
use App\Models\Estudiante;
use App\Models\Etiqueta;
use App\Models\Experiencia;
use App\Models\Habilidades;
use App\Models\Idiomas;
use App\Models\Educacion;
use App\Models\CV;
use Illuminate\Database\Eloquent\Casts\Json;

class CvController extends Controller {
    public function storeCV(Request $request)
    {
        $jsonData = $request->all();

        $validator = Validator::make($jsonData, [
            'nombre_completo' => 'required|string|max:100',
            'cedula'=> 'required|int',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|string',
            'estado_civil' => 'nullable|string|max:50',
            'licencia' => 'nullable|string|max:255',
            'carnet_de_conducir' => 'nullable|string|max:255',
            'idiomas' => 'nullable|array', 
            'educacion' => 'nullable|array',
            'educacion.*.nivel' => 'required|string|max:50',
            'educacion.*.institucion' => 'required|string|max:100',
            'educacion.*.titulo' => 'required|string|max:100',
            'educacion.*.fecha_inicio' => 'required|date',
            'educacion.*.fecha_fin' => 'nullable|date',
            'educacion.*.actualmente' => 'required|boolean',
            'educacion.*.fin_estimado' => 'nullable|date',
            'educacion.*.descripcion' => 'nullable|string|max:500',
            'experiencia' => 'nullable|array',
            'experiencia.*.puesto' => 'nullable|string|max:100',
            'experiencia.*.empresa' => 'nullable|string|max:100',
            'experiencia.*.fecha_inicio' => 'nullable|date',
            'experiencia.*.fecha_fin' => 'nullable|date',
            'experiencia.*.descripcion' => 'nullable|string|max:500',
            'experiencia.*.referencias' => 'nullable|string|max:255',
            'habilidades' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'code' => 422
            ];
            return response()->json($data, 422);
        } else {

            $id = Estudiante::where('ci_estudiante', $jsonData['cedula'])->get('id')->first()->id;

            $existingCV = CV::where('estudiante_id', $id)->first();
            
            if ($existingCV) {
                $data = [
                    'status' => 'error',
                    'message' => 'El estudiante ya tiene un CV registrado.',
                    'code' => 409
                ];
                return response()->json($data, 409);
            }
            

            $cv = CV::create([
                'estudiante_id' => $id,
                'nombre_completo' => $jsonData['nombre_completo'],
                'fecha_nacimiento' => $jsonData['fecha_nacimiento'],
                'genero' => $jsonData['genero'],
                'estado_civil' => $jsonData['estado_civil'],
                'licencia' => $jsonData['licencia'],
            ]);

            if (isset($jsonData['educacion'])) {
                foreach ($jsonData['educacion'] as $educacion) {
                    Educacion::create([
                        'cv_id' => $cv->id,
                        'nivel' => $educacion['nivel'],
                        'institucion' => $educacion['institucion'],
                        'titulo' => $educacion['titulo'],
                        'fecha_inicio' => $educacion['fecha_inicio'],
                        'fecha_fin' => $educacion['fecha_fin'],
                        'actualmente' => $educacion['actualmente'],
                        'fin_estimado' => $educacion['fin_estimado'],
                        'descripcion' => $educacion['descripcion'],
                    ]);
                }
            }

            if (isset($jsonData['experiencia'])) {
                foreach ($jsonData['experiencia'] as $experiencia) {
                    Experiencia::create([
                        'cv_id' => $cv->id,
                        'puesto' => $experiencia['puesto'],
                        'empresa' => $experiencia['empresa'],
                        'fecha_inicio' => $experiencia['fecha_inicio'],
                        'fecha_fin' => $experiencia['fecha_fin'],
                        'descripcion' => $experiencia['descripcion'],
                        'referencias' => $experiencia['referencias'],
                    ]);
                }
            }

            if (isset($jsonData['habilidades'])) {
                foreach ($jsonData['habilidades'] as $habilidad) {
                    Habilidades::create([
                        'cv_id' => $cv->id,
                        'habilidad' => $habilidad['habilidad'],
                        'nivel' => $habilidad['nivel'],
                    ]);
                }
            }

            if (isset($jsonData['idiomas'])) {
                foreach ($jsonData['idiomas'] as $idioma) {
                    Idiomas::create([
                        'cv_id' => $cv->id,
                        'idioma' => $idioma['idioma'],
                        'nivel' => $idioma['nivel'],
                    ]);
                }
            }

            $data = [
                'status' => 'success',
                'message' => 'CV created successfully',
                'cv' => $cv,
                'code' => 201
            ];
            
            return response()->json($data, 201);
        }
    }

    public function deleteCV($estudiante_id){

        $validator = Validator::make(['estudiante_id' => $estudiante_id], [
            'estudiante_id' => 'required|integer|exists:estudiante,id',
        ]);

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'code' => 422
            ];
            return response()->json($data, 422);
        } else {


            $cv = CV::where('estudiante_id', $estudiante_id)->first();
            if (!$cv) {
                $data = [
                    'status' => 'error',
                    'message' => 'CV no encontrado para el estudiante especificado.',
                    'code' => 404
                ];
                return response()->json($data, 404);
            }


            $cv->delete();
            $data = [
                'status' => 'success',
                'message' => 'CV eliminado exitosamente.',
                'code' => 200
            ];
            return response()->json($data, 200);
        }
    }
    public function cvDetails(): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $cv = CV::where('estudiante_id', $user->id)->first();
            $estudiante = Estudiante::where('id', $user->id)->first();
            $idiomas = Idiomas::where('cv_id', $cv->id)->get(['idioma', 'nivel']);
    
            if ($cv && $estudiante) {
                $cvData = [
                    'nombre_completo' => $cv->nombre_completo,
                    'ci_estudiante' => $estudiante->ci_estudiante,
                    'fecha_nacimiento' => $cv->fecha_nacimiento,
                    'genero' => $cv->genero,
                    'estado_civil' => $cv->estado_civil,
                    'licencia' => $cv->licencia,
                    // 'carnet_de_conducir' => $cv->carnet_de_conducir,        no está en la DB lo dejo comentado
                    'idiomas' => $idiomas
                ];
                return response(['data' => $cvData], 200);
            } else {
                return response(['data' => 'CV o estudiante no encontrado'], 404);
            }
        }
    
        return response(['data' => 'Unauthorized'], 401);
    }
}