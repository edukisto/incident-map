<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIncidentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "title" => [
                'required',
                'string',
                'min:5',
                'max:255'
            ],

            "address" => [
                'nullable',
                'string',
                'min:10',
                'max:255'
            ],
            "anamnesis" => [
                'required',
                'string',
                'min:10',
            ],
            "occured_on" => [
                'required',
                Rule::date()->beforeOrEqual(today()),
            ],
            'location' => 'required|array|size:2',
            'location.0' => 'required|numeric|between:-180,180', // lng
            'location.1' => 'required|numeric|between:-90,90',   // lat
        ];
    }
}
