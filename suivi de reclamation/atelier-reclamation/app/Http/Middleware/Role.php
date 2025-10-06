<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Role
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôle requis : ' . implode(', ', $roles)
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
