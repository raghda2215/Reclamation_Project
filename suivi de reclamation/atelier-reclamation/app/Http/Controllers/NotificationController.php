<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            $notifications = Notification::with(['user', 'reclamation'])->get();
            return response()->json($notifications, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la récupération des notifications: {$e->getMessage()}", 500);
        }
    }

   public function store(Request $request)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user || $user->role !== 'administratif') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôle requis : administratif'
            ], Response::HTTP_FORBIDDEN);
        }

        $targetUser = User::find($request->input('user_id'));
        if (!$targetUser || $targetUser->role !== 'responsable_qualite') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les responsables qualité peuvent être notifiés'
            ], Response::HTTP_BAD_REQUEST);
        }

        $notification = new Notification([
            'message' => $request->input('message'),
            'user_id' => $request->input('user_id'),
            'reclamation_id' => $request->input('reclamation_id'),
        ]);
        $notification->save();

        $this->sendPushNotification($notification);

        return response()->json($notification, 201);
    } catch (\Exception $e) {
        return response()->json("Erreur lors de la création de la notification: {$e->getMessage()}", 500);
    }
}
    public function show($id)
    {
        try {
            $notification = Notification::with(['user', 'reclamation'])->findOrFail($id);
            return response()->json($notification, 200);
        } catch (\Exception $e) {
            return response()->json("Notification non trouvée: {$e->getMessage()}", 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->update($request->all());
            return response()->json($notification, 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la mise à jour de la notification: {$e->getMessage()}", 500);
        }
    }

    public function destroy($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->delete();
            return response()->json("Notification supprimée avec succès", 200);
        } catch (\Exception $e) {
            return response()->json("Erreur lors de la suppression de la notification: {$e->getMessage()}", 500);
        }
    }

    private function sendPushNotification($notification)
    {
        $user = $notification->user;
        if ($user && $user->expo_push_token) {
            $client = new Client();
            try {
                $response = $client->post('https://exp.host/--/api/v2/push/send', [
                    'json' => [
                        'to' => $user->expo_push_token,
                        'title' => 'Nouvelle réclamation',
                        'body' => $notification->message,
                        'data' => ['reclamationId' => $notification->reclamation_id],
                    ],
                    'headers' => [
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer pvVxa_VAvjAi9OPULRrLATLfFpNsB02bL1jMoCII', // Token Expo fourni
                    ],
                ]);

                $result = json_decode($response->getBody(), true);
                // Vérifier la structure de la réponse Expo
                if (isset($result['data']) && $result['data']['status'] === 'ok') {
                    Log::info('Notification push envoyée avec succès', ['response' => $result]);
                } elseif (isset($result['errors'])) {
                    Log::error('Échec de l\'envoi de la notification push', ['errors' => $result['errors']]);
                } else {
                    Log::warning('Réponse inattendue de l\'API Expo', ['response' => $result]);
                }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi de la notification push', ['error' => $e->getMessage()]);
            }
        }
    }
}