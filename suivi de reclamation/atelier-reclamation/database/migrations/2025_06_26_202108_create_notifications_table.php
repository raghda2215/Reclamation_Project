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
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();
        $table->text('message');
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('reclamation_id')->nullable();
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('reclamation_id')->references('id')->on('reclamations')->onDelete('set null');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
