<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     public function up(): void
    {
        Schema::table('rapport_responsable', function (Blueprint $table) {
            // Nouveaux champs
            $table->text('remplacement')->nullable();
            $table->text('sensibilisation')->nullable();
            $table->text('assistance')->nullable();
            $table->text('autres')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('rapport_responsable', function (Blueprint $table) {
            // Supprimer les colonnes si rollback
            $table->dropColumn(['remplacement', 'sensibilisation', 'assistance', 'autres']);
        });
    }
};
