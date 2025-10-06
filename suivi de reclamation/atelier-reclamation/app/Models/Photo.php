<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;
    protected $fillable = ['url', 'reclamation_id'];

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class, 'reclamation_id');
    }
}
