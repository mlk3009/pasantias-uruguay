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
use App\Models\Empresa;
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
use App\Models\Mensaje;



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
    
            if ($user->is_suspended) {
                return response()->json(['message' => 'User account is suspended'], 403);
            }
    
            // if (is_null($user->email_verified_at)) {
            //     return response()->json(['message' => 'Email is not verified'], 403);
            // }
    
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
            ];
    
            if ($estudiante) {
                $data['genero'] = $estudiante->genero ?? null;
                $data['location'] = $estudiante->location ?? null;
                $data['ci_estudiante'] = $estudiante->ci_estudiante ?? null;
                $data['fec_nacimiento'] = $estudiante->fec_nacimiento ?? null;
                $data['cod_postal'] = $estudiante->cod_postal ?? null;
                $data['desc1'] = $estudiante->desc1 ?? null;
                $data['desc2'] = $estudiante->desc2 ?? null;

                if ($cv) {
                    $data['cv'] = $cv->pdf;
                    $data['cv_id'] = $cv->id;
                } else {
                    $data['cv'] = null;
                    $data['cv_id'] = null;
                }
        
                // Buscar imagen del estudiante
                $image = ImageUpload::where('estudiante_id', $estudiante->id)->first();
                if ($image) {
                    $data['image'] = $image->image;
                    $data['id_image'] = $image->id;
                }
        
                // Buscar archivo del estudiante
                $file = FileUpload::where('estudiante_id', $estudiante->id)->first();
                if ($file) {
                    $data['file'] = $file->file;
                }
            }
            return response(['data' => $data], 200);
        }
    
        return response(['data' => 'Unauthorized'], 401);
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
            'phone' => 'required|string|max:9|unique:users,phone',
            'rol' => 'required|in:estudiante,administrador,empresa',
            'location' => 'required_if:rol,estudiante|string|in:Artigas,Canelones,Cerro Largo,Colonia,Durazno,Flores,Florida,Lavalleja,Maldonado,Montevideo,Paysandu,Río Negro,Rivera,Rocha,Salto,San José,Soriano,Tacuarembo,Treinta y Tres',
            'ci_estudiante' => 'required_if:rol,estudiante|string|max:8|unique:estudiante',
            'fec_nacimiento' => 'required_if:rol,estudiante|date',
            'cod_postal' => 'required_if:rol,estudiante|string|max:5',
            'genero' => 'required_if:rol,estudiante|in:Masculino,Femenino,Otro',
            'sede' => 'required_if:rol,empresa|string|max:100',
            'id_image' => 'nullable|integer',
            'desc' => 'nullable|string'
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
                'is_suspended' => $jsonData['rol'] === 'empresa' ? true : false
            ]);
    
            // Crear estudiante si el rol es estudiante
            if ($jsonData['rol'] === 'estudiante') {
                $estudianteData = [
                    'ci_estudiante' => $jsonData['ci_estudiante'],
                    'id' => $user->id,
                    'cod_postal' => $jsonData['cod_postal'],
                    'location' => $jsonData['location'],
                    'genero' => $jsonData['genero'],
                    'fec_nacimiento' => $jsonData['fec_nacimiento'],
                ];
    
                // Crear el registro del estudiante primero
                $estudiante = Estudiante::create($estudianteData);
    
                // Luego actualizar el campo estudiante_id en la tabla image_uploads
                if (isset($jsonData['id_image']) && $jsonData['id_image'] !== '') {
                    $image = ImageUpload::find($jsonData['id_image']);
                    if ($image) {
                        $image->estudiante_id = $user->id;
                        $image->save();
                    }
                }
            }
    
            // Crear empresa si el rol es empresa
            if ($jsonData['rol'] === 'empresa') {
                $empresaData = [
                    'id' => $user->id,
                    'sede' => $jsonData['sede']
                ];
    
                // Crear el registro de la empresa
                $empresa = Empresa::create($empresaData);
    
                // Luego actualizar el campo empresa_id en la tabla image_uploads
                if (isset($jsonData['id_image']) && $jsonData['id_image'] !== '') {
                    $image = ImageUpload::find($jsonData['id_image']);
                    if ($image) {
                        $image->empresa_id = $user->id;
                        $image->save();
                    }
                }
    
                // Crear mensaje de solicitud de registro
                $mensajeData = [
                    'asunto' => 'Peticion de registro de empresa',
                    'mensaje' => $jsonData['desc'] ?? 'Solicitud para registrar empresa en la web',
                    'solicitud' => true,
                    'user_id' => $user->id
                ];
    
                Mensaje::create($mensajeData);
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
        $rol = Auth::user()->rol;
    
        $validator = Validator::make($jsonData, [
            'name' => 'nullable',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:9|unique:users,phone,' . $id,
            'location' => 'nullable|string|in:Artigas,Canelones,Cerro Largo,Colonia,Durazno,Flores,Florida,Lavalleja,Maldonado,Montevideo,Paysandú,Río Negro,Rivera,Rocha,Salto,San José,Soriano,Tacuarembó,Treinta y Tres',
            'ci_estudiante' => 'nullable|string|max:8|unique:estudiante,ci_estudiante,' . $id . ',id',
            'fec_nacimiento' => 'nullable|date',
            'cod_postal' => 'nullable|string|max:5',
            'genero' => 'nullable|string|in:Masculino,Femenino,Otro',
            'desc1' => 'nullable|string|max:1000',
            'desc2' => 'nullable|string|max:1000',
            'etiqueta_id' => 'nullable|exists:etiqueta,id',
            'aboutUs' => 'nullable|string|max:2000',
            'desc3' => 'nullable|string|max:1000',
            'sede' => 'nullable|string|max:100',
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
    
            if ($rol === 'estudiante') {
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
            } elseif ($rol === 'empresa') {
                $empresa = Empresa::find($id);
    
                if (isset($jsonData['aboutUs']) && $jsonData['aboutUs'] != $empresa->aboutUs) {
                    $empresa->aboutUs = $jsonData['aboutUs'];
                }
    
                if (isset($jsonData['desc1']) && $jsonData['desc1'] != $empresa->desc1) {
                    $empresa->desc1 = $jsonData['desc1'];
                }
    
                if (isset($jsonData['desc2']) && $jsonData['desc2'] != $empresa->desc2) {
                    $empresa->desc2 = $jsonData['desc2'];
                }
    
                if (isset($jsonData['desc3']) && $jsonData['desc3'] != $empresa->desc3) {
                    $empresa->desc3 = $jsonData['desc3'];
                }
    
                if (isset($jsonData['sede']) && $jsonData['sede'] != $empresa->sede) {
                    $empresa->sede = $jsonData['sede'];
                }

                $empresa->save();
            }
    
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



    public function destroy() {}
}
