<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;
use App\Models\User;
use App\Models\Estudiante;
use App\Models\Etiqueta;
use App\Models\Idiomas;
use App\Models\CV;
use App\Models\ImageUpload;
use App\Models\FileUpload;
use App\Http\Controllers\Api\Email\PHPMailerController;
use Illuminate\Process\Pipe;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;



class UserController extends Controller
{

    protected $mailer;

    public function __construct(PHPMailerController $mailer)
    {
        $this->mailer = $mailer;
    }

    public function loginUser(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()], 401);
        }

        if (Auth::attempt(['email' => $jsonData['email'], 'password' => $jsonData['password']])) {
            /** @var \App\Models\User $user **/
            $user = Auth::user();

            $success = $user->createToken('MyApp')->plainTextToken;

            return response()->json(['token' => $success], 200);
        }

        return response()->json(['message' => 'email or password wrong'], 401);
    }

    public function userDetails(): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $cv = CV::where('estudiante_id', $user->id)->first();
            $estudiante = Estudiante::where('id', $user->id)->first();
    
            $data = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'rol' => $user->rol,
                'genero' => $estudiante->genero,
                'location' => $estudiante->location,
                'ci_estudiante' => $estudiante->ci_estudiante,
                'fec_nacimiento' => $estudiante->fec_nacimiento,
                'cod_postal' => $estudiante->cod_postal,
                'desc1' => $estudiante->desc1,
                'desc2' => $estudiante->desc2,
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
    
        return response(['data' => 'Unauthorized'], 401);
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


    public function logout(): Response
    {
        if (Auth::check()) {
            /** @var \App\Models\User $user **/
            $user = Auth::user();
    
            // Eliminar solo el token de acceso personal actual
            $user->tokens()->where('id', $user->currentAccessToken()->id)->delete();
    
            return Response(['data' => 'User logged out'], 200);
        }
    
        return Response(['data' => 'Unauthorized'], 401);
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
            'ci_estudiante' => 'required_if:rol,estudiante|string|max:8|unique:estudiante',
            'fec_nacimiento' => 'required_if:rol,estudiante|date',
            'cod_postal' => 'required_if:rol,estudiante|string|max:5',
            'genero' => 'required_if:rol,estudiante|in:Masculino,Femenino,Otro',
            'id_image' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'failed_input' => $validator->failed(),
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
                    'genero' => $jsonData['genero'],
                    'fec_nacimiento' => $jsonData['fec_nacimiento'],
                ];

                if (isset($jsonData['id_image']) && $jsonData['id_image'] !== '') {
                    $estudianteData['id_image'] = $jsonData['id_image'];
                } else {
                    $estudianteData['id_image'] = null;
                }

                Estudiante::create($estudianteData);
            }

            $data = [
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user,
                'code' => 201
            ];
        }

        return response()->json($data, $data['code']);
    }



    public function update(Request $request)
    {
        $jsonData = $request->json()->all();
        $token = $request->bearerToken();
    
        $id = Auth::user()->id;
    
        $validator = Validator::make($jsonData, [
            'name' => 'nullable',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:9',
            'location' => 'nullable|string|in:Artigas,Canelones,Cerro Largo,Colonia,Durazno,Flores,Florida,Lavalleja,Maldonado,Montevideo,Paysandú,Río Negro,Rivera,Rocha,Salto,San José,Soriano,Tacuarembó,Treinta y Tres',
            'ci_estudiante' => 'nullable|string|max:8|unique:estudiante,ci_estudiante,' . $id . ',id',
            'fec_nacimiento' => 'nullable|date',
            'cod_postal' => 'nullable|string|max:5',
            'id_image' => 'nullable|integer',
            'genero' => 'nullable|string|in:Masculino,Femenino,Otro',
            'desc1' => 'nullable|string|max:280',
            'desc2' => 'nullable|string|max:280',
            'etiqueta_id' => 'nullable|exists:etiqueta,id'
        ]);
    
        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'failed_input' => $validator->failed(),
                'code' => 422
            ];
        } else {
            $user = User::find($id);
    
            if (isset($jsonData['name']) && $jsonData['name'] != $user->name) {
                $user->name = $jsonData['name'];
            }
    
            if (isset($jsonData['email']) && $jsonData['email'] != $user->email) {
                $user->email = $jsonData['email'];
            }
    
            if (isset($jsonData['phone']) && $jsonData['phone'] != $user->phone) {
                $user->phone = $jsonData['phone'];
            }
    
            $user->save();
    
            $student = Estudiante::find($id);
    
            if (isset($jsonData['ci_estudiante']) && $jsonData['ci_estudiante'] != $student->ci_estudiante) {
                $student->ci_estudiante = $jsonData['ci_estudiante'];
            }
    
            if (isset($jsonData['location']) && $jsonData['location'] != $student->location) {
                $student->location = $jsonData['location'];
            }
    
            if (isset($jsonData['fec_nacimiento']) && $jsonData['fec_nacimiento'] != $student->fec_nacimiento) {
                $student->fec_nacimiento = $jsonData['fec_nacimiento'];
            }
    
            if (isset($jsonData['cod_postal']) && $jsonData['cod_postal'] != $student->cod_postal) {
                $student->cod_postal = $jsonData['cod_postal'];
            }
    
            if (isset($jsonData['id_image']) && $jsonData['id_image'] !== '') {
                $student->id_image = $jsonData['id_image'];
            }

            if (isset($jsonData['genero']) && $jsonData['genero'] !== '') {
                $student->genero = $jsonData['genero'];
            }
    
            if (isset($jsonData['desc1']) && $jsonData['desc1'] != $student->desc1) {
                $student->desc1 = $jsonData['desc1'];
            }
    
            if (isset($jsonData['desc2']) && $jsonData['desc2'] != $student->desc2) {
                $student->desc2 = $jsonData['desc2'];
            }
    
            $student->save();
    
            // Actualizar la primera etiqueta del usuario
            if (isset($jsonData['etiqueta_id'])) {
                $etiqueta_id = $jsonData['etiqueta_id'];
                $student->etiquetas()->syncWithoutDetaching([$etiqueta_id]);
            }
    
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
        $tags = Estudiante::find($id)->etiquetas()->get(['id', 'name']);
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



    public function contactUs(Request $request)
    {
        $email = $request->input('email');
        $subject = $request->input('asunto');
        $body = $request->input('descripcion');
    
        $phpMailer = new PHPMailer(true);
    
        try {
            /* Email SMTP Settings */
            $phpMailer->SMTPDebug = 0; // Desactivar depuración                    //Enable verbose debug output
            $phpMailer->isSMTP();                                            //Send using SMTP
            $phpMailer->Host       = 'smtp.gmail.com';                       //Set the SMTP server to send through
            $phpMailer->SMTPAuth   = true;                                   //Enable SMTP authentication
            $phpMailer->Username   = 'xexperience2023@gmail.com';                 //SMTP username
            $phpMailer->Password   = 'abcr vhdx atol xpnf';                  //SMTP password
            $phpMailer->SMTPSecure = 'ssl';                                  //Enable implicit TLS encryption
            $phpMailer->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

            //UTF-8
            $phpMailer->CharSet = 'UTF-8';
            $phpMailer->Encoding = 'base64';

            //Recipients
            $phpMailer->setFrom('pasantias-uy@notResponse.com', 'Pasantias uruguay');
            $phpMailer->addAddress('xexperience2023@gmail.com');

    
            //Content
            $phpMailer->isHTML(true);
            $phpMailer->Subject = $subject;
            $phpMailer->Body = "Remitente: " . $email . ".<br><br>" . $body;    
            // Enviar el correo
            $phpMailer->send();
            return response()->json(['message' => 'Correo enviado correctamente'], 200);
        } catch (Exception $e) {
            // Manejar el error si el correo no se pudo enviar
            return response()->json(['message' => 'No se pudo enviar el correo', 'error' => $e->getMessage()], 500);
        }
    }

    public function contactMe(Request $request)
    {
        $email = $request->input('email');
        $subject = $request->input('asunto');
        $body = $request->input('descripcion');
        $emailDestino = $request->input('emailDestino');
    
        $phpMailer = new PHPMailer(true);
    
        try {
            /* Email SMTP Settings */
            $phpMailer->SMTPDebug = 0; // Desactivar depuración                    //Enable verbose debug output
            $phpMailer->isSMTP();                                            //Send using SMTP
            $phpMailer->Host       = 'smtp.gmail.com';                       //Set the SMTP server to send through
            $phpMailer->SMTPAuth   = true;                                   //Enable SMTP authentication
            $phpMailer->Username   = 'xexperience2023@gmail.com';                 //SMTP username
            $phpMailer->Password   = 'abcr vhdx atol xpnf';                  //SMTP password
            $phpMailer->SMTPSecure = 'ssl';                                  //Enable implicit TLS encryption
            $phpMailer->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

            //UTF-8
            $phpMailer->CharSet = 'UTF-8';
            $phpMailer->Encoding = 'base64';

            //Recipients
            $phpMailer->setFrom('pasantias-uy@notResponse.com', 'Pasantias uruguay');
            $phpMailer->addAddress($emailDestino);

    
            //Content
            $phpMailer->isHTML(true);
            $phpMailer->Subject = $subject;
            $phpMailer->Body = "Remitente: " . $email . ".<br><br>" . $body;    
            // Enviar el correo
            $phpMailer->send();
            return response()->json(['message' => 'Correo enviado correctamente'], 200);
        } catch (Exception $e) {
            // Manejar el error si el correo no se pudo enviar
            return response()->json(['message' => 'No se pudo enviar el correo', 'error' => $e->getMessage()], 500);
        }
    }



    public function destroy() {}
}
