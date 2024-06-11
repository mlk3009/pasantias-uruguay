<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\PHPMailerController;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Password;

class PasswordController extends Controller
{
    public function deleteCode($email)
    {
        $user = Password::where('email', $email)->first();

        if ($user) {
            $user->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Code has been deleted.',
                'code' => 200
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Code does not exist.',
                'code' => 404
            ]);
        }
    }

    public function restorePassword(Request $request)
    {
        $jsonData = $request->json()->all();

        $validator = Validator::make($jsonData, [
            'email' => 'required|email'
        ]);

        $email = $request->input('email');

        $user = User::where('email', $email)->first();

        if ($validator->fails()) {
            $data = [
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
                'code' => 422
            ];
        } else {
            if (!$user) {
                $data = [
                    'status' => 'error',
                    'message' => 'Email not found',
                    'code' => 404
                ];
                return response()->json($data, $data['code']);
            } else {
                $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                $codeLength = 6;
                $code = '';

                for ($i = 0; $i < $codeLength; $i++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }

                $subject = 'Restablecimiento de contraseña';
                $body = 'El codigo para restablecer la contraseña es: ' . $code;


                $phpMailer = new PHPMailerController();

                if ($phpMailer->sendEmail($jsonData['email'], $subject, $body) == false) {
                    $data = [
                        'status' => 'error',
                        'message' => 'Email not sent',
                        'code' => 400
                    ];
                    return response()->json($data, $data['code']);
                } else {

                    $this->deleteCode($email);

                    $code = Password::create([
                        'email' => $request->input('email'),
                        'code' => $code
                    ]);

                    $smtpLog = ob_get_clean();

                    return $data = [
                        'status' => 'success',
                        'message' => 'Email sent successfully',
                        'smtpLog' => $smtpLog,
                        'code' => 201
                    ];
                }
            }
        }

        return response()->json($data, $data['code']);
    }


    public function checkCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        $email = $request->input('email');
        $code = $request->input('code');

        $user = Password::where('email', $email)->where('code', $code)->first();

        if ($user) {
            $this->deleteCode($email);
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
}
