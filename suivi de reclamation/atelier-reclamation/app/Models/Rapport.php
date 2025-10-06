<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $fillable = ['titre', 'contenu', 'reclamation_id'];

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class, 'reclamation_id');
    }

    public function responsables()
    {
        return $this->belongsToMany(User::class, 'rapport_responsable', 'rapport_id', 'responsable_id')
            ->withPivot('date_affectation', 'est_valide', 'date_examen');
    }

    public function photos()
    {
        return $this->belongsToMany(Photo::class, 'rapport_photos', 'rapport_id', 'photo_id');
    }
}