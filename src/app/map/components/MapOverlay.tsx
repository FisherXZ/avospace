'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MapOverlay() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('nearby');

  const handleRecenter = () => {
    // This will be handled by the map component
    console.log('Recenter map');
  };

  const handleLayers = () => {
    console.log('Toggle layers');
  };

  const handleSearch = () => {
    console.log('Open search');
  };

  const handleAvatar = () => {
    router.push('/account');
  };

  return (
    <div className="ui-layer">
      <div className="ui-inner">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="avatar" onClick={handleAvatar} title="Go to profile">
            🥑
          </div>
          <div className="search-chip" onClick={handleSearch}>
            <span className="icon">🔍</span>
            <span className="placeholder">Search friends, places...</span>
          </div>
        </div>

        {/* Bottom Sheet */}
        <div className="bottom-sheet">
          <div className="bottom-handle"></div>
          <div className="bottom-title">🗺️ Study Spots Near You</div>
          <div className="bottom-subtitle">
            Find where your friends are studying on campus
          </div>
          
          <div className="pill-row">
            <div 
              className={`pill ${activeFilter === 'nearby' ? 'active' : ''}`}
              onClick={() => setActiveFilter('nearby')}
            >
              📍 Nearby
            </div>
            <div 
              className={`pill ${activeFilter === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveFilter('friends')}
            >
              👥 Friends
            </div>
            <div 
              className={`pill ${activeFilter === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveFilter('favorites')}
            >
              ⭐ Favorites
            </div>
          </div>

          <button 
            className="primary-btn"
            onClick={() => router.push('/avo_study')}
          >
            📋 View Full Roster
          </button>
        </div>
      </div>

      {/* Floating Right Buttons */}
      <div className="right-buttons">
        <button 
          className="round-btn" 
          onClick={handleRecenter}
          title="Re-center map"
        >
          🎯
        </button>
        <button 
          className="round-btn" 
          onClick={handleLayers}
          title="Map layers"
        >
          🗺️
        </button>
      </div>
    </div>
  );
}

