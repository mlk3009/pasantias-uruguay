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
use App\Models\Links;
use App\Models\Experiencia;
use App\Models\Habilidades;
use App\Models\Educacion;
use App\Models\CV;
use App\Models\ImageUpload;
use App\Http\Controllers\Api\PHPMailerController;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\URL;



class UserController extends Controller
{
    
    protected $mailer;

    public function __construct(PHPMailerController $mailer)
    {
        $this->mailer = $mailer;
    }


    public function checkEmailCode(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'code' => 'required'
    ]);

    $email = $request->input('email');
    $code = $request->input('code');

    $Emailuser = Email::where('email', $email)->where('code', $code)->first();

    if ($Emailuser) {
        $user = User::where('email', $email)->first();

        // Verificar el correo electrónico
        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Code is correct.',
            'code' => 200
        ]);
    } else {
        return response()->json([
            'status' => 'error',
            'message' => 'Code is incorrect.',
            'code' => 401
        ]);
    }
}

    public function loginUser(Request $request)
    {

        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return Response(['message' => $validator->errors()], 401);
        }

        if (Auth::attempt(['email' => $jsonData['email'], 'password' => $jsonData['password']])) {
            $user = Auth::user();
            
            // Verificar si el correo electrónico del usuario ha sido verificado
            if ($user->email_verified_at === null) {
            
                
            // Generar el código de verificación
            $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            $codeLength = 6;
            $code = '';
    

            for ($i = 0; $i < $codeLength; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }


            // Actualizar el código en la base de datos
            $email = Email::where('email', $jsonData['email'])
            ->update(['code' => $code]);

    
            // Enviar correo electrónico de verificación
            $subject = 'Verificación de correo electrónico';
            $body = 'El nuevo código para verificar tu correo electrónico es: ' . $code;
    
            ob_start(); 
    
            $phpMailer = new PHPMailerController();
    
            if ($phpMailer->sendEmail($jsonData['email'], $subject, $body) == false) {
                $data = [
                    'status' => 'error',
                    'message' => 'Email not sent',
                    'code' => 400
                ];
                return response()->json($data, $data['code']);
            } else {
                $smtpLog = ob_get_clean(); 
    
                $data = [
                    'status' => 'success',
                    'message' => 'User logged in successfully',
                    'data' => $user,
                    'smtpLog' => $smtpLog,
                    'code' => 201
                ];
            }

            }
            $success = $user->createToken('MyApp')->plainTextToken;
            return Response(['token' => $success], 200);
        }

        return Response(['message' => 'email or password wrong'], 401);
    }

    public function userDetails(): Response
    {
        if (Auth::check()) {

            $user = Auth::user();

            return Response(['data' => $user], 200);
        }

        return Response(['data' => 'Unauthorized'], 401);
    }

    public function logout(): Response
    {
        if (Auth::check()) {

            $user = Auth::user();

            $user->tokens()->delete();

            return Response(['data' => 'User logged out'], 200);
        }

        return Response(['data' => 'Unauthorized'], 401);
    }

    public function index()
    {
    }


    public function delete_image($id)
    {

        $imageUpload = ImageUpload::find($id);
        if (!$imageUpload) {
            return response()->json([
                'success' => false,
                'message' => 'Imagen no encontrada',
            ], 404);
        }
    
        $imageName = $imageUpload->image;

        $imagePath = public_path('images/uploads/' . $imageName);
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $imageUpload->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada con éxito',
        ]);
    }

    public function store_image(Request $request)
    {
        // De momento no apliqué el validated, de momento.
        $validated = $request->validate([
            'image' => 'required|mimes:jpg,jpeg,png,bmp',
        ]);

        $imageName = '';
        if ($image = $request->file('image')) {
            $imageName = time() . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move('images/uploads', $imageName);
        }
    
        $imageUpload = ImageUpload::create([
            'image' => $imageName,
        ]);
    
        return response()->json([
            'success' => true,
            'message' => 'Imagen subida con éxito',
            'image' => $imageName,
            'id' => $imageUpload->id,
        ]);
    }

    public function store(Request $request)
{
    $jsonData = $request->json()->all();
    // Probablemente sea temporal, la linea de abajo establece automaticamente el valor del atributo rol a estudiante
    $jsonData['rol'] = $jsonData['rol'] ?? 'estudiante';
    $validator = Validator::make($jsonData, [
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required',
        'phone' => 'required|string|max:9',
        'rol' => 'required|in:estudiante,administrador,empresa',
        'location' => 'required_if:rol,estudiante|string|in:Artigas,Canelones,Cerro Largo,Colonia,Durazno,Flores,Florida,Lavalleja,Maldonado,Montevideo,Paysandu,Río Negro,Rivera,Rocha,Salto,San José,Soriano,Tacuarembo,Treinta y Tres',
        'ci_estudiante' => 'required_if:rol,estudiante|string|max:8', 
        'fec_nacimiento' => 'required_if:rol,estudiante|date',
        'cod_postal' => 'required_if:rol,estudiante|string|max:5',
        'id_image' => 'nullable|integer',
    ]);

    if ($validator->fails()) {
        $data = [
            'status' => 'error',
            'message' => 'Validation Error',
            'errors' => $validator->errors(),
            'code' => 422
        ];
    } else {
        $user = User::create([
            'name' => $jsonData['name'],
            'email' => $jsonData['email'],
            'password' => bcrypt($jsonData['password']),
            'rol' => $jsonData['rol'],
            'phone' => $jsonData['phone'],
        ]);

    // Crear estudiante si el rol es estudiante, es un poco diferente al de arriba pq primero ingresa los datos en $estudianteData
    // Luego mira si existe id_image y lo pone si existe, y luego a lo ultimo crea el estudiante
    if ($jsonData['rol'] === 'estudiante') {
    $estudianteData = [
        'ci_estudiante' => $jsonData['ci_estudiante'],
        'id' => $user->id,
        'cod_postal' => $jsonData['cod_postal'],
        'location' => $jsonData['location'],
        'fec_nacimiento' => $jsonData['fec_nacimiento'],
    ];

    if (isset($jsonData['id_image']) && $jsonData['id_image'] !== '') {
        $estudianteData['id_image'] = $jsonData['id_image'];
    } else {
        $estudianteData['id_image'] = null;
    }

    Estudiante::create($estudianteData);
}


    
            // Generar el código de verificación
            $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            $codeLength = 6;
            $code = '';
    
            for ($i = 0; $i < $codeLength; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }
    
            // Guardar el código en la base de datos
            $email = Email::create([
            'email' => $jsonData['email'],
            'code' => $code
        ]);
    
            // Enviar correo electrónico de verificación
            $subject = 'Verificación de correo electrónico';
            $body = 'El código para verificar tu correo electrónico es: ' . $code;
    
            ob_start(); 
    
            $phpMailer = new PHPMailerController();
    
            if ($phpMailer->sendEmail($jsonData['email'], $subject, $body) == false) {
                $data = [
                    'status' => 'error',
                    'message' => 'Email not sent',
                    'code' => 400
                ];
                return response()->json($data, $data['code']);
            } else {
                $smtpLog = ob_get_clean(); 
    
                $data = [
                    'status' => 'success',
                    'message' => 'User created successfully',
                    'data' => $user,
                    'smtpLog' => $smtpLog,
                    'code' => 201
                ];
            }
        }
    
        return response()->json($data, $data['code']);
    }




    public function show()
    {
    }

    public function update(Request $request)
    {
        $jsonData = $request->json()->all();
        $token = $request->bearerToken();

        $id = Auth::user()->id;

        $validator = Validator::make($jsonData, [
            'name' => 'required',
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'code' => 422
            ];
        } else {
            $user = User::find($id);
            $user->name = $jsonData['name'];
            $user->email = $jsonData['email'];
            $user->save();
            $data = [
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user,
                'code' => 201
            ];
        }

        return response()->json($data, $data['code']);
    }

    public function changePassword(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'code' => 422
            ];
        } else {
            $user = User::where('email', $jsonData['email'])->first();
            $user->password = bcrypt($jsonData['password']);
            $user->save();
            $data = [
                'status' => 'success',
                'message' => 'Password updated successfully',
                'data' => $user,
                'code' => 201
            ];
        }

        return response()->json($data, $data['code']);
    }
    

    public function AddUsertags(Request $request){
    
        $jsonData = $request->json()->all();
    
        $validator = Validator::make($jsonData, [
            'estudiante_id' => 'required',
            'etiqueta_id' => 'required',
            
        ]);
    
        if($validator->fails()) {
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

    public function showUsertags($id){
        {
            $tags = Estudiante::find($id)->etiquetas()->get();
            if (!$tags) {
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
    }

    public function showTags(){
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
    }

    
    public function storeCV(Request $request)
{
    $jsonData = $request->all();

    $validator = Validator::make($jsonData, [
        'estudiante_id' => 'required|integer|exists:estudiante,id',
        'nombre_completo' => 'required|string|max:100',
        'fecha_nacimiento' => 'required|date',
        'nacionalidad' => 'required|string|max:50',
        'genero' => 'required|in:masculino,femenino,otro',
        'estado_civil' => 'nullable|string|max:50',
        'licencia' => 'nullable|string|max:255',
        'carnet_de_conducir' => 'nullable|string|max:255',
        'idiomas' => 'nullable|string',
        'links' => 'nullable|array',
        'links.*.link' => 'required|string|max:255', 
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
        'experiencia.*.puesto' => 'required|string|max:100',
        'experiencia.*.empresa' => 'required|string|max:100',
        'experiencia.*.fecha_inicio' => 'required|date',
        'experiencia.*.fecha_fin' => 'nullable|date',
        'experiencia.*.descripcion' => 'nullable|string|max:500',
        'experiencia.*.referencias' => 'nullable|string|max:255',
        'habilidades' => 'nullable|array',
        'habilidades.*.habilidad' => 'required|string|max:100',
        'habilidades.*.nivel' => 'required|string|max:50',
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
        $existingCV = CV::where('estudiante_id', $jsonData['estudiante_id'])->first();
        if ($existingCV) {
            $data = [
                'status' => 'error',
                'message' => 'El estudiante ya tiene un CV registrado.',
                'code' => 409
            ];
            return response()->json($data, 409);
        }

        $cv = CV::create([
            'estudiante_id' => $jsonData['estudiante_id'],
            'nombre_completo' => $jsonData['nombre_completo'],
            'fecha_nacimiento' => $jsonData['fecha_nacimiento'],
            'nacionalidad' => $jsonData['nacionalidad'],
            'genero' => $jsonData['genero'],
            'estado_civil' => $jsonData['estado_civil'],
            'licencia' => $jsonData['licencia'],
            'carnet_de_conducir' => $jsonData['carnet_de_conducir'],
            'idiomas' => $jsonData['idiomas'],
        ]);

        if (isset($jsonData['links'])) {
            foreach ($jsonData['links'] as $link) {
                Links::create([
                    'cv_id' => $cv->id,
                    'link' => $link['link'],
                ]);
            }
        }

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
        $data = [
            'status' => 'success',
            'message' => 'CV eliminado exitosamente.',
            'code' => 200
        ];
        return response()->json($data, 200);
    }
}

    public function destroy()
    {
    }
}
