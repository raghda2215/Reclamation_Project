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
    Schema::create('rapports', function (Blueprint $table) {
        $table->id();
        $table->string('titre', 100);
        $table->text('contenu');
        $table->unsignedBigInteger('reclamation_id');
        $table->foreign('reclamation_id')->references('id')->on('reclamations')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapports');
    }
};
