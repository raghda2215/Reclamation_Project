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
    Schema::create('reclamations', function (Blueprint $table) {
        $table->id();
        $table->string('titre', 100);
        $table->text('description');
        $table->enum('statut', ['en_attente', 'en_cours', 'resolu'])->default('en_attente');
        $table->unsignedBigInteger('client_id');
        $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamations');
    }
};
