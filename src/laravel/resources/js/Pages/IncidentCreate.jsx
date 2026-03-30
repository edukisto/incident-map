import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import MapPicker from '../Components/MapPicker'; // кастомный компонент выбора точки

export default function IncidentCreate() {
  const { data, setData, post, processing, errors } = useForm({
    anamnesis: '',
    address: '',
    location: [37.6173, 55.7558], // [lng, lat] по умолчанию (Москва)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/incidents'); // отправка на store
  };

  const handleMapClick = (lng, lat) => {
    setData('location', [lng, lat]);
    // Можно также попробовать обратный геокодинг для получения адреса
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Создание нового инцидента</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="anamnesis">Описание *</label>
          <textarea
            id="anamnesis"
            value={data.anamnesis}
            onChange={(e) => setData('anamnesis', e.target.value)}
            required
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.anamnesis && <div style={{ color: 'red' }}>{errors.anamnesis}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address">Адрес (необязательно)</label>
          <input
            type="text"
            id="address"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.address && <div style={{ color: 'red' }}>{errors.address}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Местоположение на карте</label>
          <MapPicker
            initialCenter={data.location}
            onMapClick={handleMapClick}
            height="400px"
          />
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Координаты: {data.location[1]?.toFixed(5)}, {data.location[0]?.toFixed(5)}
          </div>
          {errors.location && <div style={{ color: 'red' }}>{errors.location}</div>}
        </div>

        <button
          type="submit"
          disabled={processing}
          style={{
            padding: '10px 20px',
            background: '#4facfe',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {processing ? 'Сохранение...' : 'Создать инцидент'}
        </button>
      </form>
    </div>
  );
}
