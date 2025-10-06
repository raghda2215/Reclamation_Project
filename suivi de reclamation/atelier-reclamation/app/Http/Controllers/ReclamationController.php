<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class ReclamationController extends Controller
{
    public function index()
    {
        try {
            $reclamations = Reclamation::with('client')->get();
            return response()->json($reclamations, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la récupération des réclamations: {$e->getMessage()}", 500);
        }
    }

  public function store(Request $request)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();

        $allowedRoles = ['commercial', 'administratif'];
        if (!$user || !in_array($user->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôles requis : ' . implode(', ', $allowedRoles)
            ], Response::HTTP_FORBIDDEN);
        }

        $raw = $request->input('formData');
        $formData = is_string($raw) ? (json_decode($raw, true) ?? $raw) : $raw;

        $reclamation = Reclamation::create([
            'titre' => $request->input('titre'),
            'form_data' => $formData,
            'client_id' => $request->input('client_id'),
        ]);

        return response()->json($reclamation->load('client'), 201);
    } catch (\Exception $e) {
        return response()->json("Erreur lors de la création de la réclamation: {$e->getMessage()}", 500);
    }
}

public function update(Request $request, $id)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();

        $allowedRoles = ['commercial', 'administratif'];
        if (!$user || !in_array($user->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôles requis : ' . implode(', ', $allowedRoles)
            ], Response::HTTP_FORBIDDEN);
        }

        $reclamation = Reclamation::findOrFail($id);

        $raw = $request->input('formData');
        $formData = is_string($raw) ? (json_decode($raw, true) ?? $raw) : $raw;

        $reclamation->update([
            'titre' => $request->input('titre', $reclamation->titre),
            'form_data' => $formData ?? $reclamation->form_data,
            'client_id' => $request->input('client_id', $reclamation->client_id),
        ]);

        return response()->json($reclamation->load('client'), 200);
    } catch (\Exception $e) {
        return response()->json("Erreur lors de la mise à jour de la réclamation: {$e->getMessage()}", 500);
    }
}

    public function show($id)
    {
        try {
            $reclamation = Reclamation::with('client')->findOrFail($id);
            return response()->json($reclamation, 200);
        } catch (\Exception $e) {
            return response()->json("Réclamation non trouvée: {$e->getMessage()}", 404);
        }
    }

   
    public function destroy($id)
    {
        try {
            // Récupérer l'utilisateur authentifié
            $user = JWTAuth::parseToken()->authenticate();

            // Vérifier les rôles autorisés
            $allowedRoles = ['commercial', 'administratif'];
            if (!$user || !in_array($user->role, $allowedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Rôles requis : ' . implode(', ', $allowedRoles)
                ], Response::HTTP_FORBIDDEN);
            }

            $reclamation = Reclamation::findOrFail($id);
            $reclamation->delete();

            return response()->json("Réclamation supprimée avec succès", 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la suppression de la réclamation: {$e->getMessage()}", 500);
        }
    }
public function details($id)
{
    // On récupère la réclamation avec son client et ses photos
    $reclamation = Reclamation::with(['client', 'photos'])->find($id);

    if (!$reclamation) {
        return response()->json([
            'message' => 'Réclamation non trouvée'
        ], 404);
    }

    // On s'assure que formData est bien parsé
    $reclamation->formData = $reclamation->form_data; // ou tu peux garder l'accessor getFormDataAttribute()

    return response()->json($reclamation, 200);
}

}