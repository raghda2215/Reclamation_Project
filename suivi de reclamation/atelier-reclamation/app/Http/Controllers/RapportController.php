<?php
namespace App\Http\Controllers;
use App\Models\Rapport;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;


class RapportController extends Controller
{
    public function index()
    {
        return response()->json(Rapport::with(['reclamation', 'photos'])->get(), 200);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || $user->role !== 'administratif') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }
        $rapport = Rapport::create($request->only(['titre', 'contenu', 'reclamation_id']));
        // Associer des photos si présentes dans la requête (similaire à PhotoController)
        if ($request->has('photo_ids')) {
            $rapport->photos()->attach($request->input('photo_ids'));
        }
        return response()->json($rapport->load('photos'), 201);
    }
public function show($id)
{
    try {
        $rapport = Rapport::with([
            'reclamation.client',
            'reclamation.photos',
            'responsables'
        ])->findOrFail($id);

        return response()->json($rapport, 200);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    public function update(Request $request, $id)
    {
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json([], 200);
        }
        $rapport->update($request->only(['titre', 'contenu', 'reclamation_id']));
        // Mettre à jour les photos si présentes
        if ($request->has('photo_ids')) {
            $rapport->photos()->sync($request->input('photo_ids'));
        }
        return response()->json($rapport->load('photos'), 200);
    }

    public function destroy($id)
    {
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json([], 200);
        }
        $rapport->photos()->detach(); // Supprimer les associations avec les photos
        $rapport->delete();
        return response()->json("Rapport supprimé avec succès", 200);
    }

    public function affecter(Request $request, $id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || !in_array($user->role, ['administrateur', 'administratif'])) {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json(['success' => false, 'message' => 'Rapport non trouvé'], Response::HTTP_NOT_FOUND);
        }
        $responsableIds = $request->input('responsable_ids', []);
        $dateAffectation = $request->input('date_affectation');
        
        if (!$dateAffectation) {
            return response()->json(['success' => false, 'message' => 'Date d\'affectation requise'], Response::HTTP_BAD_REQUEST);
        }
        try {
            $parsedDate = Carbon::parse($dateAffectation)->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Format de date invalide'], Response::HTTP_BAD_REQUEST);
        }
        
        if (empty($responsableIds)) {
            return response()->json(['success' => false, 'message' => 'Aucun responsable sélectionné'], Response::HTTP_BAD_REQUEST);
        }
        foreach ($responsableIds as $responsableId) {
            $responsable = User::find($responsableId);
            if (!$responsable || $responsable->role !== 'responsable_qualite') {
                return response()->json(['success' => false, 'message' => "Responsable invalide: $responsableId"], Response::HTTP_BAD_REQUEST);
            }
            $rapport->responsables()->syncWithoutDetaching([
                $responsableId => ['date_affectation' => $parsedDate]
            ]);
        }
        return response()->json(['success' => true, 'message' => 'Rapport affecté avec succès'], Response::HTTP_OK);
    }

    public function valider(Request $request, $id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || $user->role !== 'responsable_qualite') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json(['success' => false, 'message' => 'Rapport non trouvé'], Response::HTTP_NOT_FOUND);
        }
        $responsableRapport = $rapport->responsables()->where('responsable_id', $user->id)->first();
        if (!$responsableRapport) {
            return response()->json(['success' => false, 'message' => 'Ce rapport ne vous est pas affecté'], Response::HTTP_FORBIDDEN);
        }
        $partsValides = $request->input('parts', []);
        $responsableRapport->pivot->parts_valides = json_encode($partsValides);
        $responsableRapport->pivot->date_examen = $request->input('date_examen');
        $responsableRapport->pivot->est_valide = true;
        $responsableRapport->pivot->save();
        return response()->json(['success' => true, 'message' => 'Rapport validé avec succès'], Response::HTTP_OK);
    }

    public function getResponsables()
    {
        try {
            $responsables = User::where('role', 'responsable_qualite')->get();
            return response()->json($responsables, Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Erreur lors de la récupération des responsables: {$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function mesRapports(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || $user->role !== 'responsable_qualite') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }
        $rapports = Rapport::with(['reclamation', 'photos', 'responsables' => function ($query) use ($user) {
            $query->where('responsable_id', $user->id);
        }])
            ->whereHas('responsables', function ($query) use ($user) {
                $query->where('responsable_id', $user->id);
            })
            ->get();
        return response()->json($rapports, Response::HTTP_OK);
    }

    public function validerReclamations(Request $request, $id)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || $user->role !== 'responsable_qualite') {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $rapport = Rapport::with('reclamation')->find($id);
        if (!$rapport) {
            return response()->json(['success' => false, 'message' => 'Rapport non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $responsableRapport = $rapport->responsables()->where('responsable_id', $user->id)->first();
        if (!$responsableRapport) {
            return response()->json(['success' => false, 'message' => 'Ce rapport ne vous est pas affecté'], Response::HTTP_FORBIDDEN);
        }

        $parts = $request->input('parts', []);
        if (empty($parts)) {
            return response()->json(['success' => false, 'message' => 'Aucune réclamation sélectionnée'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification uniquement pour la réclamation associée
        $validParts = [];
        if ($rapport->reclamation && in_array($rapport->reclamation->id, $parts)) {
            $validParts[] = $rapport->reclamation->id;
        }

        if (empty($validParts)) {
            return response()->json(['success' => false, 'message' => 'Aucune réclamation valide sélectionnée'], Response::HTTP_BAD_REQUEST);
        }

        $dateExamen = $request->input('date_examen');
        if (!$dateExamen) {
            return response()->json(['success' => false, 'message' => 'Date d\'examen requise'], Response::HTTP_BAD_REQUEST);
        }

        $responsableRapport->pivot->parts_valides = json_encode($validParts);
        $responsableRapport->pivot->date_examen = Carbon::parse($dateExamen)->format('Y-m-d H:i:s');
        $responsableRapport->pivot->est_valide = true;
        $responsableRapport->pivot->remplacement = $request->input('remplacement', '');
        $responsableRapport->pivot->sensibilisation = $request->input('sensibilisation', '');
        $responsableRapport->pivot->assistance = $request->input('assistance', '');
        $responsableRapport->pivot->autres = $request->input('autres', '');
        $responsableRapport->pivot->save();

        return response()->json(['success' => true, 'message' => 'Réclamation validée avec succès'], Response::HTTP_OK);

    } catch (\Exception $e) {
        Log::error('Erreur lors de la validation des réclamations', [
            'rapport_id' => $id,
            'user_id' => $user->id ?? null,
            'parts' => $request->input('parts', []),
            'date_examen' => $request->input('date_examen'),
            'error' => $e->getMessage(),
        ]);
        return response()->json(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

}
?>