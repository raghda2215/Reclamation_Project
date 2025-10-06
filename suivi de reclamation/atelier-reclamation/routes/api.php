<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\ReclamationController;

// Routes d'authentification (sans middleware)
Route::group([
    'middleware' => 'api',
    'prefix' => 'users'
], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::get('users/verify-email', [AuthController::class, 'verifyEmail'])->name('verify.email');

// Routes protégées par authentification
Route::group(['middleware' => ['auth:api']], function () {
    Route::get('/rapports', [RapportController::class, 'index']);
    Route::get('/rapports/{id}', [RapportController::class, 'show']);
    Route::post('/rapports', [RapportController::class, 'store']);  
Route::put('/rapports/{id}', [RapportController::class, 'update']); 
Route::delete('/rapports/{id}', [RapportController::class, 'destroy']); 
Route::get('/reclamations', [ReclamationController::class, 'index']);
    Route::post('/rapports/{id}/affecter', [RapportController::class, 'affecter']);
    Route::post('/rapports/{id}/valider', [RapportController::class, 'valider']);
    Route::get('/mes-rapports', [RapportController::class, 'mesRapports']);
    Route::post('/users/update-push-token', [UserController::class, 'updatePushToken']);
    Route::get('/responsables', [RapportController::class, 'getResponsables']);
    Route::post('/rapports/{id}/valider-reclamations', [RapportController::class, 'validerReclamations']);
    
    // --- Clients (CRUD) ---
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
    
    // --- Réclamations (CRUD) ---
    Route::get('/reclamations', [ReclamationController::class, 'index']);
    Route::post('/reclamations', [ReclamationController::class, 'store']);
    Route::get('/reclamations/{id}', [ReclamationController::class, 'show']);
    Route::put('/reclamations/{id}', [ReclamationController::class, 'update']);
    Route::delete('/reclamations/{id}', [ReclamationController::class, 'destroy']);

// Route pour récupérer les détails d'une réclamation par ID
Route::get('/reclamations/{id}/details', [ReclamationController::class, 'details']);


    
    // --- Photos ---
    Route::get('/photos', [PhotoController::class, 'index']);
    Route::post('/photos', [PhotoController::class, 'store']);
    Route::get('/photos/{id}', [PhotoController::class, 'show']);
    Route::delete('/photos/{id}', [PhotoController::class, 'destroy']);
Route::get('/users', [UserController::class, 'index']);
    Route::group(['middleware' => ['jwt.auth']], function () {
        
    // Récupérer toutes les notifications
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Créer une nouvelle notification
    Route::post('/notifications', [NotificationController::class, 'store']);

    // Afficher une notification spécifique (par ID)
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);

    // Mettre à jour une notification
    Route::put('/notifications/{id}', [NotificationController::class, 'update']);
    Route::patch('/notifications/{id}', [NotificationController::class, 'update']); 

    // Supprimer une notification
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});
});