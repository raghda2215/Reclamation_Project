<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    use HasFactory;

    protected $fillable = ['titre', 'form_data', 'client_id'];

    protected $casts = [
        'form_data' => 'array',
    ];

    protected $appends = ['formData'];

    protected $hidden = ['form_data'];

    // Accessor pour exposer "formData" (camelCase)
    public function getFormDataAttribute()
    {
        return $this->attributes['form_data'] ?? null;
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
     public function photos()
    {
        return $this->hasMany(Photo::class, 'reclamation_id');
    }
}
