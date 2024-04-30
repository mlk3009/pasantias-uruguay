<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Email;
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
            return Response(['message' => 'Email not verified'], 401);
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




    public function store(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'name' => 'required',
            'email' => 'required|email|unique:users',
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
            $user = User::create([
                'name' => $jsonData['name'],
                'email' => $jsonData['email'],
                'password' => bcrypt($jsonData['password'])
            ]);



            // Generar el código de verificación
            $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            $codeLength = 6;
            $code = '';

            for ($i = 0; $i < $codeLength; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }



            // Guardar el código en la base de datos
            $email = Email::create([
                'email' => $request->input('email'),
                'code' => $code
            ]);



            // Enviar correo electrónico de verificación
            $subject = 'Verificación de correo electrónico';
            $body = 'El código para verificar tu correo electrónico es: ' . $code;

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

    public function destroy()
    {
    }
}
