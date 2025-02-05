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
use FPDF;

class CvController extends Controller
{
    public function storeCV(Request $request)
    {
        $jsonData = $request->all();
    
        $validator = Validator::make($jsonData, [
            'nombre_completo' => 'required|string|max:100',
            'cedula' => 'required|int',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|string',
            'estado_civil' => 'nullable|string|max:50',
            'licencia' => 'nullable|string|max:255',
            'carnet_de_conducir' => 'nullable|string|max:255',
            'idiomas.idiomas' => 'nullable|array',
            'idiomas.idiomas.*.idioma' => 'required|string|max:50',
            'idiomas.idiomas.*.nivel' => 'required|string|max:50',
            'educacion.estudios' => 'nullable|array',
            'educacion.estudios.*.nivel' => 'required|string|max:50',
            'educacion.estudios.*.institucion' => 'required|string|max:100',
            'educacion.estudios.*.titulo' => 'required|string|max:100',
            'educacion.estudios.*.fecha_inicio' => 'required|date',
            'educacion.estudios.*.fecha_fin' => 'nullable|date',
            'educacion.estudios.*.actualmente' => 'nullable|boolean',
            'educacion.estudios.*.fin_estimado' => 'nullable|date',
            'educacion.estudios.*.descripcion' => 'nullable|string|max:500',
            'experiencias' => 'nullable|array',
            'experiencias.*.puesto' => 'nullable|string|max:100',
            'experiencias.*.empresa' => 'nullable|string|max:100',
            'experiencias.*.fecha_inicio' => 'nullable|date',
            'experiencias.*.fecha_fin' => 'nullable|date',
            'experiencias.*.descripcion' => 'nullable|string|max:500',
            'experiencias.*.referencias' => 'nullable|string|max:255',
            'habilidades.habilidades' => 'nullable|array',
            'habilidades.habilidades.*.habilidad' => 'required|string|max:50',
            'habilidades.habilidades.*.nivel' => 'required|string|max:50'
        ]);
    
        if ($validator->fails()) {
            $errors = $validator->errors()->toArray();
            $formattedErrors = [];
    
            foreach ($errors as $field => $messages) {
                foreach ($messages as $message) {
                    $formattedErrors[] = [
                        'field' => $field,
                        'message' => $message,
                        'type' => 'validation'
                    ];
                }
            }
    
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $formattedErrors,
                'code' => 422
            ];
            return response()->json($data, 422);
        } else {
            $estudiante = Estudiante::where('ci_estudiante', $jsonData['cedula'])->first();
    
            if (!$estudiante) {
                $data = [
                    'status' => 'error',
                    'message' => 'Estudiante no encontrado.',
                    'code' => 404
                ];
                return response()->json($data, 404);
            }
    
            $id = $estudiante->id;
    
            // Eliminar el CV existente si existe
            $cv = CV::where('estudiante_id', $id)->first();
            if ($cv) {
                $cv->delete();
            }
    
            $cv = CV::create([
                'estudiante_id' => $id,
                'nombre_completo' => $jsonData['nombre_completo'],
                'fecha_nacimiento' => $jsonData['fecha_nacimiento'],
                'genero' => $jsonData['genero'],
                'estado_civil' => $jsonData['estado_civil'],
                'licencia' => $jsonData['licencia'],
            ]);
    
            if (isset($jsonData['educacion']['estudios'])) {
                foreach ($jsonData['educacion']['estudios'] as $educacion) {
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
    
            if (isset($jsonData['experiencias'])) {
                foreach ($jsonData['experiencias'] as $experiencia) {
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
    
            if (isset($jsonData['habilidades']['habilidades'])) {
                foreach ($jsonData['habilidades']['habilidades'] as $habilidad) {
                    Habilidades::create([
                        'cv_id' => $cv->id,
                        'habilidad' => $habilidad['habilidad'],
                        'nivel' => $habilidad['nivel'],
                    ]);
                }
            }
    
            if (isset($jsonData['idiomas']['idiomas'])) {
                foreach ($jsonData['idiomas']['idiomas'] as $idioma) {
                    Idiomas::create([
                        'cv_id' => $cv->id,
                        'idioma' => $idioma['idioma'],
                        'nivel' => $idioma['nivel'],
                    ]);
                }
            }

            try {
                $this->generarPDF($cv->id);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error generating PDF: ' . $e->getMessage(),
                    'code' => 500
                ], 500);
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


    public function deleteCV($estudiante_id)
    {
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
    
            // Llamar a la función borrarPDF
            $borrarPDFResponse = $this->borrarPDF($estudiante_id);
    
            $data = [
                'status' => 'success',
                'message' => 'CV eliminado exitosamente.',
                'pdf_message' => json_decode($borrarPDFResponse->getContent(), true)['data'],
                'code' => 200
            ];
            return response()->json($data, 200);
        }
    }
    
    public function borrarPDF($estudianteId)
    {
        $estudiante = Estudiante::find($estudianteId);
    
        if ($estudiante) {
            $ci_estudiante = $estudiante->ci_estudiante;
    
            $pdfPath = 'pdfs/cv_' . $ci_estudiante . '.pdf';
    
            if (file_exists($pdfPath)) {
                // Borrar el archivo
                unlink($pdfPath);
                return response(['data' => 'PDF borrado exitosamente.'], 200);
            } else {
                return response(['data' => 'El archivo PDF no existe.'], 404);
            }
        } else {
            return response(['data' => 'Estudiante no encontrado'], 404);
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



    public function generarPDF($cvId)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $cv = CV::where('id', $cvId)->where('estudiante_id', $user->id)->first();
            $estudiante = Estudiante::where('id', $user->id)->first();
            $idiomas = Idiomas::where('cv_id', $cv->id)->get();
            $educacion = Educacion::where('cv_id', $cv->id)->get();
            $experiencia = Experiencia::where('cv_id', $cv->id)->get();
            $habilidades = Habilidades::where('cv_id', $cv->id)->get();

            if ($cv && $estudiante) {
                // Verificar que el campo ci_estudiante no esté vacío
                $ci_estudiante = $estudiante->ci_estudiante ?? 'sin_ci';

                // Ruta del archivo PDF
                $pdfPath = 'pdfs/cv_' . $ci_estudiante . '.pdf';

                // Verificar si el archivo ya existe
                if (file_exists($pdfPath)) {
                    return response(['data' => 'El PDF ya existe.'], 409);
                }

                // Crear una instancia de FPDF
                $pdf = new FPDF();
                $pdf->AddPage();
                $pdf->SetFont('Arial', 'B', 16);

                // Título principal
                $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Curriculum Vitae'), 0, 1, 'C');



                // Imagen
                $this->addSection($pdf, '', function ($pdf) use ($estudiante) {
                    $id_image = $estudiante->id_image;
                    if ($id_image !== null) {
                        $imageRecord = \App\Models\ImageUpload::find($id_image);
                        if ($imageRecord) {
                            $rutaImagen = 'images/uploads/' . $imageRecord->image;

                            if (file_exists($rutaImagen)) {
                                // Ajuestes en las dimensiones de la imagen
                                $pageWidth = $pdf->GetPageWidth();
                                $imageWidth = 50; // Ajusta el tamaño según sea necesario
                                $imageHeight = 50; // Ajusta el tamaño según sea necesario
                                $xPosition = ($pageWidth - $imageWidth) / 2;
                                $pdf->Image($rutaImagen, $xPosition, null, $imageWidth, $imageHeight);
                            } else {
                                // Este es por si el archivo no existe
                                $pdf->SetTextColor(255, 0, 0);
                                $pdf->Cell(0, 10, 'NO IMAGEN', 0, 1, 'C');
                                $pdf->SetTextColor(0, 0, 0);
                            }
                        } else {
                            // Este es por si no se encuentra el registro de la imagen en la db
                            $pdf->SetTextColor(255, 0, 0);
                            $pdf->Cell(0, 10, 'NO IMAGEN', 0, 1, 'C');
                            $pdf->SetTextColor(0, 0, 0);
                        }
                    } else {
                        // Este es por si el estudiante no tiene imagen
                        $pdf->SetTextColor(255, 0, 0);
                        $pdf->Cell(0, 10, 'NO IMAGEN', 0, 1, 'C');
                        $pdf->SetTextColor(0, 0, 0);
                    }
                });


                // Datos personales
                $this->addSection($pdf, 'Datos Personales', function ($pdf) use ($cv, $estudiante) {
                    $pdf->SetFont('Arial', '', 12);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Nombre Completo: ') . iconv('UTF-8', 'ISO-8859-1', $cv->nombre_completo), 0, 1);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Cédula: ') . iconv('UTF-8', 'ISO-8859-1', $estudiante->ci_estudiante), 0, 1);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fecha de Nacimiento: ') . iconv('UTF-8', 'ISO-8859-1', $cv->fecha_nacimiento), 0, 1);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Género: ') . iconv('UTF-8', 'ISO-8859-1', $cv->genero), 0, 1);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Estado Civil: ') . iconv('UTF-8', 'ISO-8859-1', $cv->estado_civil), 0, 1);
                    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Licencia: ') . iconv('UTF-8', 'ISO-8859-1', $cv->licencia), 0, 1);
                });

                // Idiomas
                $this->addSection($pdf, 'Idiomas', function ($pdf) use ($idiomas) {
                    $pdf->SetFont('Arial', '', 12);
                    foreach ($idiomas as $idioma) {
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', $idioma->idioma) . iconv('UTF-8', 'ISO-8859-1', ' - Nivel: ') . iconv('UTF-8', 'ISO-8859-1', $idioma->nivel), 0, 1);
                    }
                });

                // Educación
                $this->addSection($pdf, 'Educación', function ($pdf) use ($educacion) {
                    $pdf->SetFont('Arial', '', 12);
                    foreach ($educacion as $edu) {
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Nivel: ') . iconv('UTF-8', 'ISO-8859-1', $edu->nivel), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Institución: ') . iconv('UTF-8', 'ISO-8859-1', $edu->institucion), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Título: ') . iconv('UTF-8', 'ISO-8859-1', $edu->titulo), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fecha Inicio: ') . iconv('UTF-8', 'ISO-8859-1', $edu->fecha_inicio), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fecha Fin: ') . iconv('UTF-8', 'ISO-8859-1', $edu->fecha_fin), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Actualmente: ') . ($edu->actualmente ? iconv('UTF-8', 'ISO-8859-1', 'Sí') : iconv('UTF-8', 'ISO-8859-1', 'No')), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fin Estimado: ') . iconv('UTF-8', 'ISO-8859-1', $edu->fin_estimado ? $edu->fin_estimado : 'Indeterminado'), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Descripción: ') . iconv('UTF-8', 'ISO-8859-1', $edu->descripcion), 0, 1);
                        $pdf->Ln(5);
                    }
                });

                // Experiencia
                $this->addSection($pdf, 'Experiencia', function ($pdf) use ($experiencia) {
                    $pdf->SetFont('Arial', '', 12);
                    foreach ($experiencia as $exp) {
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Puesto: ') . iconv('UTF-8', 'ISO-8859-1', $exp->puesto), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Empresa: ') . iconv('UTF-8', 'ISO-8859-1', $exp->empresa), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fecha Inicio: ') . iconv('UTF-8', 'ISO-8859-1', $exp->fecha_inicio), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Fecha Fin: ') . iconv('UTF-8', 'ISO-8859-1', $exp->fecha_fin), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Descripción: ') . iconv('UTF-8', 'ISO-8859-1', $exp->descripcion), 0, 1);
                        $pdf->Ln(5);
                    }
                });

                // Habilidades
                $this->addSection($pdf, 'Habilidades', function ($pdf) use ($habilidades) {
                    $pdf->SetFont('Arial', '', 12);
                    foreach ($habilidades as $habilidad) {
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Habilidad: ') . iconv('UTF-8', 'ISO-8859-1', $habilidad->habilidad), 0, 1);
                        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', 'Nivel: ') . iconv('UTF-8', 'ISO-8859-1', $habilidad->nivel), 0, 1);
                        $pdf->Ln(5);
                    }
                });

                // Guardar el PDF en un archivo
                $pdf->Output('F', $pdfPath);

                return response(['data' => 'PDF generado exitosamente.'], 200);
            } else {
                return response(['data' => 'CV o estudiante no encontrado'], 404);
            }
        }

        return response(['data' => 'Unauthorized'], 401);
    }

    private function addSection($pdf, $title, $contentCallback, $imageHeight = 50) // Esta es para que funcione bien el salto de pagina pq antes quedaba cortado
    {
        $pdf->SetFont('Arial', 'B', 14);
        if ($pdf->GetY() + $imageHeight > 260) { // Si se llega a cortar el pdf, sumarle el tamaño del titulo a esto (20) o mejor sumarselo a la variable $imageHeight
            $pdf->AddPage();
        }
        $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1', $title), 0, 1);
        $contentCallback($pdf);
        $pdf->Ln(10);
    }
}