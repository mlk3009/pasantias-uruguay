<?php
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CvController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\PublicationController;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// USER 
Route::post('login', [UserController::class, 'loginUser']);
Route::post('register', [UserController::class, 'store']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('user', [UserController::class, 'userDetails']);
    Route::post('logout', [UserController::class, 'logout']);
    Route::get('cv-details', [CvController::class, 'cvDetails']);
    Route::get('/cvPDF/{cvId}', [CvController::class, 'generarPDF']);
});


//POSTULACIONES
Route::post('/postular', [PublicationController::class, 'crearPostulacion']);
Route::put('/actualizar-postulacion/{publication_id}/{estudiante_id}', [PublicationController::class, 'actualizarEstadoPostulacion']);
Route::get('/postulante/{estudiante_id}', [PublicationController::class, 'obtenerDatosEstudiante']);


//CV
Route::post('/cv', [CvController::class, 'storeCV']);
Route::delete('/dropcv/{estudiante_id}', [CvController::class, 'deleteCV']);
Route::delete('cvdeletePDF/{estudianteId}', [CvController::class, 'borrarPDF']);

//TAGS
Route::post('/addUserTag', [UserController::class, 'AddUsertags']);
Route::get('/showUserTag/{id}', [UserController::class, 'ShowUsertags']);
Route::get('/showTags', [UserController::class, 'showTags']);

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