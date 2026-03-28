import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { router } from '@inertiajs/react';

export default function IncidentIndexMapPage({ incidents }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [airQualityData, setAirQualityData] = useState(null);
  const [windData, setWindData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Функция удаления инцидента
  const deleteIncident = async (incidentId, event) => {
    if (event) event.stopPropagation();
    if (!confirm('Вы уверены, что хотите удалить инцидент?')) return;

    try {
      const response = await fetch(`/incidents/${incidentId}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        }
      });

      if (response.ok) {
        router.visit('/incidents', {
          preserveScroll: true,
          preserveState: false,
          onSuccess: () => console.log('Инцидент удалён')
        });
      } else {
        console.error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  // Функция получения данных о качестве воздуха и ветре
  const fetchDataByCoordinates = async (lat, lon, incident = null, event = null) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    setLoading(true);
    try {
      const [airRes, weatherRes] = await Promise.all([
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10&timezone=auto&forecast_days=1`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=winddirection_10m,windspeed_10m&timezone=auto`)
      ]);

      const airData = await airRes.json();
      const weatherData = await weatherRes.json();

      setAirQualityData({
        pm25: airData.hourly?.pm2_5?.[0],
        pm10: airData.hourly?.pm10?.[0],
        latitude: lat,
        longitude: lon
      });

      setWindData({
        direction: weatherData.current_weather?.winddirection || weatherData.hourly?.winddirection_10m?.[0] || 0,
        speed: weatherData.current_weather?.windspeed || weatherData.hourly?.windspeed_10m?.[0] || 0
      });

      setSelectedPoint(incident ? {
        type: 'incident',
        id: incident.id,
        coordinates: [lon, lat],
        name: incident.anamnesis || 'Инцидент',
        address: incident.address
      } : {
        type: 'location',
        coordinates: [lon, lat],
        name: `Координаты: ${lat.toFixed(4)}, ${lon.toFixed(4)}`
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setAirQualityData(null);
      setWindData(null);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (map.current) return;

    const defaultCenter = [37.6173, 55.7558];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: defaultCenter,
      zoom: 10
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('click', (e) => {
      e.originalEvent?.stopPropagation();
      const { lng, lat } = e.lngLat;
      fetchDataByCoordinates(lat, lng);
    });

    map.current.on('mouseenter', () => {
      map.current.getCanvas().style.cursor = 'crosshair';
    });

    map.current.on('mouseleave', () => {
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('load', () => {
      if (!incidents || incidents.length === 0) return;

      incidents.forEach(incident => {
        if (!incident.location?.coordinates) return;

        // Создаем маркер без предварительного popup
        const marker = new maplibregl.Marker({ color: '#ff4444' })
          .setLngLat([incident.location.coordinates[0], incident.location.coordinates[1]])
          .addTo(map.current);

        // Добавляем обработчик клика на маркер
        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();

          const lat = incident.location.coordinates[1];
          const lon = incident.location.coordinates[0];

          // Загружаем данные о качестве воздуха
          fetchDataByCoordinates(lat, lon, incident, e);

          // Формируем содержимое popup с двумя кнопками
          const popupContent = `
            <div style="font-family: system-ui, sans-serif; min-width: 220px;">
              <div style="margin-bottom: 8px;">
                <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${incident.anamnesis || 'Нет описания'}</strong>
                ${incident.address ? `<small style="color: #666; display: block;">📍 ${incident.address}</small>` : ''}
                <small style="color: #999; display: block; margin-top: 4px;">🕒 ${new Date(incident.created_at).toLocaleString()}</small>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e0e0e0;">
                <button
                  id="air-quality-btn-${incident.id}"
                  data-lat="${lat}"
                  data-lon="${lon}"
                  data-name="${incident.anamnesis || 'Инцидент'}"
                  style="flex: 1; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: transform 0.2s;"
                  onmouseover="this.style.transform='scale(1.02)'"
                  onmouseout="this.style.transform='scale(1)'"
                >
                  🌍 Качество воздуха
                </button>
                <button
                  id="delete-incident-btn-${incident.id}"
                  data-id="${incident.id}"
                  style="flex: 1; padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: transform 0.2s;"
                  onmouseover="this.style.transform='scale(1.02)'"
                  onmouseout="this.style.transform='scale(1)'"
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          `;

          // Получаем существующий popup или создаем новый
          let markerPopup = marker.getPopup();

          if (markerPopup) {
            // Обновляем содержимое существующего popup
            markerPopup.setHTML(popupContent);
            // Если popup закрыт - открываем
            if (!markerPopup.isOpen()) {
              marker.togglePopup();
            }
          } else {
            // Создаем новый popup и привязываем к маркеру
            const newPopup = new maplibregl.Popup({
              offset: 25,
              closeButton: true,
              closeOnClick: false,
              maxWidth: '280px'
            }).setHTML(popupContent);
            marker.setPopup(newPopup);
            marker.togglePopup();
          }

          // Добавляем обработчики кнопок после отрисовки popup
          setTimeout(() => {
            const airBtn = document.getElementById(`air-quality-btn-${incident.id}`);
            const deleteBtn = document.getElementById(`delete-incident-btn-${incident.id}`);

            if (airBtn) {
              // Удаляем старый обработчик, чтобы не накапливать
              const newAirBtn = airBtn.cloneNode(true);
              airBtn.parentNode.replaceChild(newAirBtn, airBtn);

              newAirBtn.addEventListener('click', (btnEvent) => {
                btnEvent.stopPropagation();
                btnEvent.preventDefault();
                const lat = parseFloat(newAirBtn.dataset.lat);
                const lon = parseFloat(newAirBtn.dataset.lon);
                const name = newAirBtn.dataset.name;
                fetchDataByCoordinates(lat, lon, { ...incident, anamnesis: name }, btnEvent);
              });
            }

            if (deleteBtn) {
              // Удаляем старый обработчик
              const newDeleteBtn = deleteBtn.cloneNode(true);
              deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

              newDeleteBtn.addEventListener('click', (btnEvent) => {
                btnEvent.stopPropagation();
                btnEvent.preventDefault();
                const id = parseInt(newDeleteBtn.dataset.id);
                deleteIncident(id, btnEvent);
              });
            }
          }, 150);
        });

        markersRef.current.push(marker);
      });
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [incidents]);

  // Функции для отображения AQI и ветра
  const getAQIColor = (pm25) => {
    if (!pm25) return '#999';
    if (pm25 <= 12) return '#00e400';
    if (pm25 <= 35.4) return '#ffff00';
    if (pm25 <= 55.4) return '#ff7e00';
    return '#ff0000';
  };

  const getWindDirection = (degrees) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getAirQualityLevel = (pm25) => {
    if (!pm25) return 'Нет данных';
    if (pm25 <= 12) return 'Хорошо';
    if (pm25 <= 35.4) return 'Удовлетворительно';
    if (pm25 <= 55.4) return 'Умеренно';
    return 'Неблагоприятно';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Инфопанель качества воздуха */}
      {(airQualityData || windData || loading) && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '250px',
          fontFamily: 'system-ui, sans-serif',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {selectedPoint && (
            <div style={{
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e0e0e0',
              fontSize: '14px',
              color: '#666'
            }}>
              <strong style={{ color: '#333' }}>📍 Выбрано:</strong><br/>
              <span style={{ fontSize: '13px' }}>{selectedPoint.name}</span>
              {selectedPoint.address && (
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#888' }}>
                  {selectedPoint.address}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div>⏳ Загрузка данных...</div>
            </div>
          ) : (
            <>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🌍 Качество воздуха</h3>

              {airQualityData ? (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>PM2.5</span>
                      <span style={{ fontWeight: 'bold', color: getAQIColor(airQualityData.pm25) }}>
                        {airQualityData.pm25?.toFixed(1) || '—'} µg/m³
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>PM10</span>
                      <span>{airQualityData.pm10?.toFixed(1) || '—'} µg/m³</span>
                    </div>
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getAQIColor(airQualityData.pm25),
                      color: airQualityData.pm25 <= 35.4 ? '#333' : 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {getAirQualityLevel(airQualityData.pm25)}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: '#999', marginBottom: '15px', textAlign: 'center', padding: '10px' }}>
                  👆 Нажмите на карту или маркер<br/>для получения данных
                </div>
              )}

              {windData && (
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>💨 Ветер</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `rotate(${windData.direction}deg)`,
                      transition: 'transform 0.3s',
                      background: '#f5f5f5',
                      borderRadius: '50%'
                    }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4 L12 20 M12 4 L8 8 M12 4 L16 8" stroke="#4facfe" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{getWindDirection(windData.direction)}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{Math.round(windData.direction)}°</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{windData.speed?.toFixed(1)} км/ч</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !airQualityData && !windData && (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              👆 Кликните по карте или маркеру<br/>
              для просмотра данных
            </div>
          )}
        </div>
      )}

      {/* Легенда качества воздуха */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'white',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Качество воздуха (PM2.5)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#00e400', borderRadius: '2px' }}></div>
          <span>Хорошо (0-12)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ffff00', borderRadius: '2px' }}></div>
          <span>Удовлетворительно (12-35)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ff7e00', borderRadius: '2px' }}></div>
          <span>Умеренно (35-55)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ff0000', borderRadius: '2px' }}></div>
          <span>Неблагоприятно (55+)</span>
        </div>
      </div>

      {/* Подсказка */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}>
        💡 Кликните по карте или маркеру для просмотра качества воздуха и ветра
      </div>

      {/* Кнопка добавления нового инцидента */}
      <button
        onClick={() => router.visit('/incidents/create')}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateX(-50%) scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateX(-50%) scale(1)'}
      >
        ➕ Добавить инцидент
      </button>
    </div>
  );
}
