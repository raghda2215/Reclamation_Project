<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up()
    {Schema::create('rapport_responsable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapport_id')->constrained()->onDelete('cascade');
            $table->foreignId('responsable_id')->constrained('users')->onDelete('cascade');
            $table->date('date_affectation');
            $table->boolean('est_valide')->default(false);
            $table->date('date_examen')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rapport_responsable');
    }
};
