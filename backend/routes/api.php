<?php
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\VerificationController;





Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// USER
Route::post('login', [UserController::class, 'loginUser']);
Route::post('register', [UserController::class, 'store']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('user', [UserController::class, 'userDetails']);
    Route::post('logout', [UserController::class, 'logout']);
});


// PASSWORD
Route::post('restore', [PasswordController::class, 'restorePassword']);
Route::post('checkCode', [PasswordController::class, 'checkCode']);
Route::put('changePassword', [UserController::class, 'changePassword']);



// EMAIL VERIFICATION
// Ruta para verificar el correo electrónico
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');


