'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MapOverlay from './MapOverlay';

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a1a',
      color: '#e5e7eb',
      fontSize: '18px',
      fontWeight: 600
    }}>
      Loading map...
    </div>
  )
});

export default function MapView() {
  const [mapReady, setMapReady] = useState(false);

  return (
    <>
      <DynamicMap onMapReady={() => setMapReady(true)} />
      <MapOverlay />
    </>
  );
}

