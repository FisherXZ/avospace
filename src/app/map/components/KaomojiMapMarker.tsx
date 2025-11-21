'use client';

import { PopulatedCheckIn } from '@/types/study';
import { useState } from 'react';
import MapUserAvatar from './MapUserAvatar';
import './KaomojiMapMarker.css';

interface KaomojiMapMarkerProps {
  checkIn: PopulatedCheckIn;
  position: {
    x: number; // Pixel offset from center
    y: number; // Pixel offset from center
  };
  onClick: (checkIn: PopulatedCheckIn) => void;
}

/**
 * Snapchat-style Kaomoji Marker Wrapper
 * Positions the MapUserAvatar on the map and handles tooltips
 */
export default function KaomojiMapMarker({ checkIn, position, onClick }: KaomojiMapMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    // Toggle sticky tooltip on first click
    if (!isClicked) {
      setIsClicked(true);
      // Open modal after a short delay to let user see tooltip
      setTimeout(() => {
        onClick(checkIn);
        setIsClicked(false);
      }, 300);
    } else {
      // Direct click if already clicked
      onClick(checkIn);
    }
  };

  // Show tooltip on hover OR when clicked (sticky)
  const showTooltip = isHovered || isClicked;

  return (
    <div
      className="kaomoji-map-marker-wrapper"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false); // Reset clicked state on mouse leave
      }}
    >
      {/* Reusable Stylish Avatar */}
      <MapUserAvatar
        kao={checkIn.user?.kao || '(^_^)'}
        status={checkIn.status}
        size="md"
        onClick={handleClick}
        className="marker-avatar"
      />

      {/* Tooltip - Visible on hover OR click */}
      {showTooltip && (
        <div className="kaomoji-tooltip">
          <div className="tooltip-username">@{checkIn.user?.username || 'unknown'}</div>
          {checkIn.statusNote && (
            <div className="tooltip-note">"{checkIn.statusNote}"</div>
          )}
          <div className="tooltip-hint">
            {isClicked ? 'Opening...' : 'Click for details'}
          </div>
        </div>
      )}
    </div>
  );
}

