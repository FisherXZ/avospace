'use client';

import { PopulatedCheckIn } from '@/types/study';
import './MapMarkerOverlay.css';

interface MapMarkerOverlayProps {
  spotName: string;
  checkIns: PopulatedCheckIn[];
  onClick?: (checkIn: PopulatedCheckIn) => void;
}

export default function MapMarkerOverlay({ spotName, checkIns, onClick }: MapMarkerOverlayProps) {
  const maxVisible = 3;
  const visibleCheckIns = checkIns.slice(0, maxVisible);
  const remainingCount = checkIns.length - maxVisible;

  return (
    <div className="map-marker-overlay">
      {/* Header */}
      <div className="map-marker-header">
        <span className="map-marker-spot-name">{spotName}</span>
        <span className="map-marker-count">{checkIns.length}</span>
      </div>

      {/* User List */}
      {checkIns.length > 0 ? (
        <div className="map-marker-users">
          {visibleCheckIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="map-marker-user"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(checkIn);
              }}
              title={`View ${checkIn.user?.username || 'user'}'s profile`}
            >
              <span className="map-marker-kao">{checkIn.user?.kao || '(^_^)'}</span>
              <span className="map-marker-username">@{checkIn.user?.username || 'unknown'}</span>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="map-marker-more">
              +{remainingCount} more
            </div>
          )}
        </div>
      ) : (
        <div className="map-marker-empty">
          <span className="empty-icon">🌱</span>
          <span className="empty-text">No one here</span>
        </div>
      )}
    </div>
  );
}

