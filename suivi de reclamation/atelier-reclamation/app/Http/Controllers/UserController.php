<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    public function updatePushToken(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $user->expo_push_token = $request->input('expo_push_token');
            $user->save();

            return response()->json(['success' => true, 'message' => 'Token de push mis à jour'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function index()
{
    try {
        $users = User::where('role', 'responsable_qualite')->get(); // Filtre uniquement les utilisateurs avec le rôle "responsable_qualite"
        return response()->json($users, 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Erreur lors de la récupération des utilisateurs'], 500);
    }
}
}