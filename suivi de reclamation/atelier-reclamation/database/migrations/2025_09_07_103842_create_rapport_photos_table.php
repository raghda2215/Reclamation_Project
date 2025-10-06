<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
    {
        Schema::create('rapport_photos', function (Blueprint $table) {
            $table->id(); // Optional: Primary key for the pivot table
            $table->foreignId('rapport_id')->constrained()->onDelete('cascade');
            $table->foreignId('photo_id')->constrained()->onDelete('cascade');
            $table->timestamps(); // Optional: Adds created_at and updated_at columns
            // Add additional metadata columns if needed, e.g.:
            // $table->string('description')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rapport_photos');
    }
};
