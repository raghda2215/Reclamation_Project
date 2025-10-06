<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    public function index()
    {
        try {
            $photos = Photo::with('reclamation')->get();
            return response()->json($photos, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la récupération des photos: {$e->getMessage()}", 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Vérifier les rôles autorisés
            $user = JWTAuth::parseToken()->authenticate();
            $allowedRoles = ['commercial', 'administratif'];
            if (!$user || !in_array($user->role, $allowedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Rôles requis : ' . implode(', ', $allowedRoles)
                ], Response::HTTP_FORBIDDEN);
            }

            // Valider la requête
            $request->validate([
                'photo' => 'required|image|max:2048', // Changed from 'url' to 'photo'
                'reclamation_id' => 'required|exists:reclamations,id',
            ]);

            // Vérifier et traiter le fichier
            if ($request->hasFile('photo')) { // Changed from 'url' to 'photo'
                $file = $request->file('photo');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = Storage::disk('public')->putFileAs('photos', $file, $fileName);

                // Créer la photo avec l'URL générée
                $photo = new Photo([
                    'url' => Storage::url($path), // URL publique (ex: /storage/photos/filename.jpg)
                    'reclamation_id' => $request->input('reclamation_id'),
                ]);
                $photo->save();

                return response()->json($photo, 201);
            }

            return response()->json([
                'success' => false,
                'message' => 'Aucun fichier image téléchargé'
            ], 400);

        } catch (\Exception $e) {
            return response()->json("Erreur lors de la création de la photo: {$e->getMessage()}", 500);
        }
    }

    public function show($id)
    {
        try {
            $photo = Photo::with('reclamation')->findOrFail($id);
            return response()->json($photo, 200);
        } catch (\Exception $e) {
            return response()->json("Photo non trouvée: {$e->getMessage()}", 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $photo = Photo::findOrFail($id);
            $photo->update($request->all());
            return response()->json($photo, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la mise à jour de la photo: {$e->getMessage()}", 500);
        }
    }

    public function destroy($id)
    {
        try {
            $photo = Photo::findOrFail($id);
            // Supprimer le fichier du stockage si nécessaire
            if ($photo->url && Storage::disk('public')->exists(str_replace('/storage/', '', $photo->url))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $photo->url));
            }
            $photo->delete();
            return response()->json("Photo supprimée avec succès", 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la suppression de la photo: {$e->getMessage()}", 500);
        }
    }
}
