<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
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
            

             // Generar el enlace de verificación
            $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
            );

            // Enviar correo electrónico de verificación
            $email = $jsonData['email'];
            $subject = 'Verificación de correo electrónico';
            $body = 'Por favor, haz clic en el enlace para verificar tu correo electrónico: ' . $url;
            $this->mailer->sendEmail($email, $subject, $body);
            
            
            event(new Registered($user));


            $data = [
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user,
                'code' => 201
            ];
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
