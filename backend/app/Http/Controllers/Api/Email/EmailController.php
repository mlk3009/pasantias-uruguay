<?php

namespace App\Http\Controllers\Api\Email;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Email;

use App\Http\Controllers\Api\Email\PHPMailerController;


class EmailController extends Controller
{

    public function validateEmail(Request $request)
    {
        $jsonData = $request->json()->all();

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
        }
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


    public function chechValidation(Request $request)
    {
        $jsonData = $request->json()->all();

        if (Auth::attempt(['email' => $jsonData['email'], 'password' => $jsonData['password']])) {
            $user = Auth::user();

            // Verificar si el correo electrónico del usuario ha sido verificado
            if ($user->email_verified_at === null) {
                return false;
            } else {
                return true;
            }
        }
    }
}