<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator; // Importation correcte de Validator
use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $input = $request->only('email', 'password');
        $jwt_token = null;

        try {
            if (!$jwt_token = JWTAuth::attempt($input)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email ou mot de passe invalide',
                ], Response::HTTP_UNAUTHORIZED);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du token : ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json([
            'success' => true,
            'token' => $jwt_token,
            'user' => JWTAuth::user(), // Utilisation de JWTAuth::user() au lieu de auth()->user()
        ]);
    }

    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|confirmed|min:6',
            'role' => 'required|string|in:administratif,commercial,responsable_qualite',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = User::create(array_merge(
            $validator->validated(),
            ['password' => bcrypt($request->password)],
            ['isActive' => false]
        ));

        // Envoyer l'email de vérification
        $verificationUrl = route('verify.email', ['email' => $user->email]);
        Mail::send([], [], function ($message) use ($user, $verificationUrl) {
            $message->to($user->email)
                ->subject('Vérification de votre email')
                ->html("<h2>{$user->name}, merci de vous être inscrit !</h2>
                        <h4>Veuillez vérifier votre email pour continuer...</h4>
                        <a href='{$verificationUrl}'>Cliquez ici</a>");
        });

        return response()->json([
            'message' => 'Utilisateur enregistré avec succès. Veuillez vérifier votre email.',
            'user' => $user
        ], 201);
    }

    /**
     * Verify Email
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyEmail(Request $request)
    {
        $user = User::where('email', $request->query('email'))->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        if ($user->isActive) {
            return response()->json([
                'success' => true,
                'message' => 'Compte déjà activé'
            ]);
        }

        $user->isActive = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Compte activé avec succès'
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken()); // Invalider le token
            return response()->json([
                'status' => 'success',
                'message' => 'Déconnexion réussie.'
            ], 200);
        } catch (JWTException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la déconnexion : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken()); // Utilisation de JWTAuth::refresh
            return $this->createNewToken($newToken);
        } catch (JWTException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'actualisation du token : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function userProfile()
    {
        return response()->json(JWTAuth::user()); // Utilisation de JWTAuth::user()
    }

    /**
     * Get the token array structure.
     *
     * @param string $token
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60, // Utilisation de JWTAuth::factory()
            'user' => JWTAuth::user() // Utilisation de JWTAuth::user()
        ]);
    }
}
?>