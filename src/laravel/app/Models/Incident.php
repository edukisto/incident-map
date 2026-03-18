<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Incident extends Model
{
    /** @use HasFactory<\Database\Factories\IncidentFactory> */
    use HasFactory;

    use HasSpatial;

    protected $casts = [
        'location' => Point::class,
    ];

    protected $fillable = [
        'address',
        'anamnesis',
        'location',
        'occured_on',
        'title',
    ];
}
