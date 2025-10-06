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
    {
        Schema::table('rapport_responsable', function (Blueprint $table) {
            $table->json('parts_valides')->nullable();
        });
    }

    public function down()
    {
        Schema::table('rapport_responsable', function (Blueprint $table) {
            $table->dropColumn('parts_valides');
        });
    }
};
