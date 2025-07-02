<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Users\UserController;
use App\Http\Controllers\Api\CvController;
use App\Http\Controllers\Api\Users\PasswordController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\Email\EmailController;
use App\Http\Controllers\Api\Users\ImagesController;
use App\Http\Controllers\Api\Users\CompanyController;
use App\Http\Controllers\Api\Users\StudentsController;
use App\Http\Controllers\Api\Users\AdminController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// USER 
Route::post('login', [UserController::class, 'loginUser']);
Route::post('register', [UserController::class, 'store']);
Route::post('/contactUs', [EmailController::class, 'contactUs']);
Route::post('/contactMe', [EmailController::class, 'contactMe']);
Route::post('/mensajes', [CompanyController::class, 'createMensaje']);

Route::group(['middleware' => ['auth:sanctum', 'track.activity']], function () {
    Route::get('user', [UserController::class, 'userDetails']);
    Route::post('logout', [UserController::class, 'logout']);
    Route::get('cv-details', [CvController::class, 'cvDetails']);
    Route::get('/cvPDF/{cvId}', [CvController::class, 'generarPDF']);
    Route::post('/cvPDF/{cvId}/regenerate', [CvController::class, 'regenerarPDF']);
    Route::get('/cv-for-edit', [CvController::class, 'getCvForEdit']);
    Route::post('/updateProfile', [UserController::class, 'update']);    
    Route::get('company', [CompanyController::class, 'companyDetails']);
    Route::get('company/applicants/{empresaId}', [CompanyController::class, 'obtenerPostulantes']);
    Route::get('/users/active-stats', [UserController::class, 'getActiveUsersStats']);
});

Route::get('company/publications/{phone}', [CompanyController::class, 'obtenerPublicaciones']);
Route::get('/userbyphone/{phone}', [StudentsController::class, 'obtenerUsuarioByPhone']);
Route::get('/companybyphone/{phone}', [CompanyController::class, 'obtenerEmpresaByPhone']);



//POSTULACIONES
Route::post('/postular', [PublicationController::class, 'crearPostulacion'])->middleware(['auth:sanctum', 'track.activity']);
Route::put('/actualizar-postulacion/{publication_id}/{estudiante_id}', [CompanyController::class, 'actualizarEstadoPostulacion'])->middleware(['auth:sanctum', 'track.activity']);
Route::post('/contactar-estudiante', [CompanyController::class, 'contactarEstudiante'])->middleware(['auth:sanctum', 'track.activity']);
Route::get('/postulante/{estudiante_id}', [PublicationController::class, 'obtenerDatosEstudiante'])->middleware(['auth:sanctum', 'track.activity']);

//VISITAS
Route::post('/publicaciones/visita', [PublicationController::class, 'estudianteVisita'])->middleware(['auth:sanctum', 'track.activity']);
Route::get('/empresa/estadisticas', [PublicationController::class, 'getEstadisticasEmpresa'])->middleware(['auth:sanctum', 'track.activity']);

//CONTACTO ESTUDIANTES
Route::post('/empresa/contactar-estudiante', [CompanyController::class, 'contactarEstudiante'])->middleware(['auth:sanctum', 'track.activity']);

//GUARDAR
Route::post('/guardar-publicacion', [PublicationController::class, 'guardarPublicacion'])->middleware(['auth:sanctum', 'track.activity']);
Route::get('/verificar-publicacion-guardada', [PublicationController::class, 'verificarPublicacionGuardada'])->middleware(['auth:sanctum', 'track.activity']);

//POSTULACIONES
Route::get('/verificar-postulacion', [PublicationController::class, 'verificarPostulacion'])->middleware(['auth:sanctum', 'track.activity']);


//ADMIN
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::get('/admin/users/search', [AdminController::class, 'searchUsers']);
    Route::patch('/admin/publications/update/{id}', [AdminController::class, 'updatePublication']);
    Route::delete('/admin/publications/delete/{id}', [AdminController::class, 'destroyPublication']);
    Route::patch('/admin/publications/soft-delete/{id}', [AdminController::class, 'softDeletePublication']);
    Route::patch('/admin/users/deactivate/{id}', [AdminController::class, 'deactivateUser']);
    Route::delete('/admin/users/delete/{id}', [AdminController::class, 'deleteUser']);
    Route::get('admin/mensajes', [AdminController::class, 'getAllMensajes']);
    Route::get('admin/mensajes/filter', [AdminController::class, 'filterMensajes']);    
    Route::delete('admin/mensajes/{id}', [AdminController::class, 'deleteMensaje']);
    Route::post('/admin/approve-user/{id}', [AdminController::class, 'approveUser']);
    Route::post('/admin/reject-user/{id}', [AdminController::class, 'rejectUser']);
});

//CV
Route::post('/cv', [CvController::class, 'storeCV']);
Route::put('/cv/{cvId}', [CvController::class, 'updateCV']);
Route::delete('/dropcv/{estudiante_id}', [CvController::class, 'deleteCV']);
Route::delete('cvdeletePDF/{estudianteId}', [CvController::class, 'borrarPDF']);

//TAGS
Route::post('/addUserTag', [StudentsController::class, 'AddUsertags']);
Route::get('/showUserTag/{id}', [StudentsController::class, 'ShowUsertags']);
Route::get('/showTags', [StudentsController::class, 'showTags']);
Route::delete('/deleteUserTag', [StudentsController::class, 'deleteUserTag']);


// PASSWORD
Route::post('restore', [PasswordController::class, 'restorePassword']);
Route::post('checkCode', [PasswordController::class, 'checkCode']);
Route::put('changePassword', [UserController::class, 'changePassword']);

// IMAGE & FILES
Route::post('upload-image', [ImagesController::class, 'store_image']);
Route::delete('delete-image/{id}', [ImagesController::class, 'delete_image']);
Route::post('upload-file', [ImagesController::class, 'store_file']);
Route::delete('delete-file/{id}', [ImagesController::class, 'delete_file']);
Route::post('cambiar-orden-img', [ImagesController::class, 'cambiarOrdenImg']);


// EMAIL VERIFICATION
// Ruta para verificar el correo electrónico
Route::post('checkEmailCode', [EmailController::class, 'checkEmailCode']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/publications/store', [PublicationController::class, 'store']);
    Route::put('/publications/update/{id}', [PublicationController::class, 'update']);
    Route::put('publications/soft-delete/{id}', [PublicationController::class, 'softDelete']);
    Route::patch('/publications/updatePartial/{id}', [PublicationController::class, 'updatePartial']);
    Route::delete('/publications/destroy/{id}', [PublicationController::class, 'destroy']);
    Route::put('publications/reactivate', [PublicationController::class, 'reactivatePublication']);
    Route::get('/company/saldo/{empresaId}', [CompanyController::class, 'obtenerSaldo']);
    Route::get('/saldos/disponibles', [CompanyController::class, 'obtenerSaldosDisponibles']);
    Route::post('/saldos/comprar', [CompanyController::class, 'comprarSaldo']);
});
Route::get('publications/search', [PublicationController::class, 'searchPublications']);

Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/show/{id}', [PublicationController::class, 'show']);
Route::get('top-categories/{limit?}', [PublicationController::class, 'getTopCategories']);
