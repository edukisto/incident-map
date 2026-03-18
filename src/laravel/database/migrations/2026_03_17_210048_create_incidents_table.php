<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use MatanYadaev\EloquentSpatial\Enums\Srid;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('address')->nullable(true);
            $table->text('anamnesis');
            $table->geography(
                'location',
                subtype: 'point',
                srid: Srid::WGS84->value
            )->spatialIndex();
            $table->dateTimeTz('occured_on');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
