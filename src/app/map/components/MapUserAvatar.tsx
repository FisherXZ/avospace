'use client';

import { CheckInStatus } from '@/types/study';
import './MapUserAvatar.css';

interface MapUserAvatarProps {
  kao: string;
  status: CheckInStatus;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

/**
 * MapUserAvatar - A stylish, reusable circular avatar for map display
 * 
 * Design Principles:
 * 1. Circular bubble shape for organic feel
 * 2. Status indicated by border color + tiny badge
 * 3. Compact footprint (defaults to 48px)
 * 4. Dropshadow for depth against map background
 */
export default function MapUserAvatar({ 
  kao, 
  status, 
  size = 'md', 
  onClick,
  className = ''
}: MapUserAvatarProps) {
  
  const getStatusEmoji = (s: CheckInStatus) => {
    switch (s) {
      case 'open': return '🤝';
      case 'solo': return '🎧';
      case 'break': return '☕';
      default: return '🤝';
    }
  };

  // Calculate dynamic font size based on length
  const getDynamicFontSize = () => {
    const len = kao.length;
    if (len <= 3) return '1.2em'; // Large for short kaos
    if (len <= 5) return '1em';   // Standard
    if (len <= 7) return '0.8em'; // Slightly smaller
    return '0.65em';              // Smallest for long kaos
  };

  return (
    <div 
      className={`map-user-avatar avatar-${size} status-${status} ${className}`}
      onClick={onClick}
    >
      <div 
        className="avatar-content"
        style={{ fontSize: getDynamicFontSize() }}
      >
        {kao}
      </div>
      <div className="avatar-badge">
        {getStatusEmoji(status)}
      </div>
    </div>
  );
}

