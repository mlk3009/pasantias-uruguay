<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class PHPMailerController extends Controller
{
    public function sendEmail($email, $subject, $body)
    {
        $mail = new PHPMailer(true);

        try {

            /* Email SMTP Settings */

            $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
            $mail->isSMTP();                                            //Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                       //Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
            $mail->Username   = 'xexperience2023@gmail.com';                 //SMTP username
            $mail->Password   = 'abcr vhdx atol xpnf';                  //SMTP password
            $mail->SMTPSecure = 'ssl';                                  //Enable implicit TLS encryption
            $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

            //UTF-8
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            //Recipients
            $mail->setFrom('pasantias-uy@notResponse.com', 'Pasantias uruguay');
            $mail->addAddress($email);

            //Content
            $mail->addAddress($email);

            $mail->isHTML(true);

            $mail->Subject = $subject;
            $mail->Body    = $body;

            if (!$mail->send()) {
                return false;
            } else {
                return true;
            }
        } catch (Exception $e) {
            return Response(['data' => 'Email not sent' . $e], 400);
        }
    }
}
