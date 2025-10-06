<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
   use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'isActive'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'isActive' => 'boolean',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role
        ];
    }

    /**
     * Définit la relation many-to-many avec le modèle Rapport via la table pivot 'rapport_responsable'.
     * C'est ici que la logique est corrigée.
     * On spécifie explicitement les noms des clés étrangères pour s'assurer que la relation fonctionne
     * même si les conventions de nommage ne sont pas standard.
     * Laravel est intelligent, mais être explicite aide à éviter ce genre de problème.
     */
     public function rapports()
{
    return $this->belongsToMany(
        Rapport::class,
        'rapport_responsable', // Nom de la table pivot
        'responsable_id',      // Clé étrangère pour User
        'rapport_id'           // Clé étrangère pour Rapport
    )->withPivot('date_affectation', 'est_valide', 'date_examen', 'parts_valides');
}
}
