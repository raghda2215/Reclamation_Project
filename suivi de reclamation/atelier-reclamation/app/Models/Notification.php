<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    protected $fillable = ['message', 'user_id', 'reclamation_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class, 'reclamation_id');
    }
}
