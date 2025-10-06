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
        Schema::table('reclamations', function (Blueprint $table) {
            $table->dropColumn('titre');
            $table->dropColumn('description');
            $table->text('form_data')->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->string('titre')->nullable()->after('id');
            $table->text('description')->nullable()->after('titre');
            $table->dropColumn('form_data');
        });
    }
};
