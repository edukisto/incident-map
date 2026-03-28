import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapPicker({ initialCenter, onMapClick, height = '400px' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: initialCenter,
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Маркер для отображения выбранной точки
    marker.current = new maplibregl.Marker({ color: '#ff4444' })
      .setLngLat(initialCenter)
      .addTo(map.current);

    // Обработчик клика
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.current.setLngLat([lng, lat]);
      if (onMapClick) onMapClick(lng, lat);
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height }} />;
}
