<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up()
    {
        Schema::table('reclamations', function (Blueprint $table) {
            // Supprimer le champ statut
            $table->dropColumn('statut');

            // Ajouter le champ titre
            $table->string('titre')->after('id'); // ou après 'form_data' selon ton besoin
        });
    }

    public function down()
    {
        Schema::table('reclamations', function (Blueprint $table) {
            // Restaurer le champ statut si rollback
            $table->string('statut')->nullable();

            // Supprimer le champ titre
            $table->dropColumn('titre');
        });
    }
};
