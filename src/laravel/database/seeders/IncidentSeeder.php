<?php

namespace Database\Seeders;

use App\Models\Incident;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Enums\Srid;
use MatanYadaev\EloquentSpatial\Objects\Point;

class IncidentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Incident::factory()->createMany([
            [
                'title' => 'Объелся домашними пельмешками',
                'anamnesis' => 'Плохо дело. Несите носилки',
                'location' => new Point(55.56111, 40.25389, Srid::WGS84),
            ],
            [
                'title' => 'Укус демонического дракона',
                'anamnesis' => 'Всё очень плохо. Носилки уже не нужны',
                'location' => new Point(55.665155, 37.5975297, Srid::WGS84),
            ],
        ]);
    }
}
