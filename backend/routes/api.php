<?php
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\PublicationController;

//asd


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

// IMAGE 
Route::post('upload-image', [UserController::class, 'store_image']);
Route::delete('delete-image/{id}', [UserController::class, 'delete_image']);


// EMAIL VERIFICATION
// Ruta para verificar el correo electrónico
Route::post('checkEmailCode', [UserController::class, 'checkEmailCode']);


Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/show/{id}', [PublicationController::class, 'show']);
Route::post('/publications/store', [PublicationController::class, 'store']);
Route::put('/publications/update/{id}', [PublicationController::class, 'update']);
Route::patch('/publications/updatePartial/{id}', [PublicationController::class, 'updatePartial']);
Route::delete('/publications/destroy/{id}', [PublicationController::class, 'destroy']);


