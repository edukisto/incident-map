<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIncidentRequest;
use App\Http\Requests\UpdateIncidentRequest;
use App\Models\Incident;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $incidents = Incident::all();

        return Inertia::render('IncidentIndexMapPage', [
            'incidents' => $incidents,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('IncidentCreate'); // новый компонент
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIncidentRequest $request)
    {
        $validated = $request->validated();

        // Если координаты приходят как массив [lng, lat] или отдельными полями
        // Предположим, что в запросе есть location (массив из двух чисел)
        $incident = Incident::create([
            'title' => $validated['title'],
            'anamnesis' => $validated['anamnesis'],
            'address'   => $validated['address'] ?? null,
            'occured_on' => $validated['occured_on'],
            'location'  => [
                'type'        => 'Point',
                'coordinates' => $validated['location'], // [lng, lat]
            ],
        ]);

        // Для запросов, ожидающих JSON (например, через fetch)
        if ($request->wantsJson()) {
            return response()->make("", 201);
        }

        // Иначе редирект на карту с сообщением
        return redirect()->route('incidents.index')
            ->with('success', 'Инцидент успешно создан');
    }

    /**
     * Display the specified resource.
     */
    public function show(Incident $incident)
    {
        // Можно вернуть данные для редактирования, если нужно
        return Inertia::render('IncidentShow', ['incident' => $incident]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Incident $incident)
    {
        return Inertia::render('IncidentEdit', ['incident' => $incident]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIncidentRequest $request, Incident $incident)
    {
        $validated = $request->validated();

        $incident->update([
            'title' => $validated['title'],
            'anamnesis' => $validated['anamnesis'],
            'address'   => $validated['address'] ?? $incident->address,
            'occured_on' => $validated['occured_on'],
            'location'  => [
                'type'        => 'Point',
                'coordinates' => $validated['location'], // [lng, lat]
            ],
        ]);

        if ($request->wantsJson()) {
            return response()->noContent();
        }

        return redirect()->route('incidents.index')
            ->with('success', 'Инцидент обновлён');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Incident $incident)
    {
        $incident->delete();

        if (request()->wantsJson()) {
            return response()->noContent();
        }

        return redirect()->route('incidents.index')
            ->with('success', 'Инцидент удалён');
    }
}
