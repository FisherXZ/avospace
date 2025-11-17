'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Sample study spots (replace with real data later)
const sampleSpots = [
  { id: 1, name: 'Main Library', lat: 37.8727, lng: -122.2601, studying: 8 },
  { id: 2, name: 'Moffitt Library', lat: 37.8726, lng: -122.2608, studying: 15 },
  { id: 3, name: 'Doe Library', lat: 37.8722, lng: -122.2591, studying: 6 },
  { id: 4, name: 'Peets Coffee', lat: 37.8699, lng: -122.2585, studying: 3 },
];

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
}

interface LeafletMapProps {
  onMapReady?: () => void;
}

export default function LeafletMap({ onMapReady }: LeafletMapProps) {
  const center = useMemo<[number, number]>(() => [37.8715, -122.2590], []); // Berkeley

  useEffect(() => {
    if (onMapReady) {
      onMapReady();
    }
  }, [onMapReady]);

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />

        {/* Sample markers - replace with real check-in data */}
        {sampleSpots.map(spot => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <strong>{spot.name}</strong><br />
              {spot.studying} avocados studying
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

