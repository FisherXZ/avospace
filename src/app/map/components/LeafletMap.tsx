'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import L, { DivIcon } from 'leaflet';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySpot, CheckIn, PopulatedCheckIn } from '@/types/study';
import { getUsersData } from '@/app/avo_study/utils/userCache';
import KaomojiMapMarker from './KaomojiMapMarker';
import UserDetailModal from '@/app/avo_study/components/UserDetailModal';
import StudyRequestModal from '@/app/avo_study/components/StudyRequestModal';
import { auth } from '@/lib/firebase';
import { CheckInPost } from '@/types/study';
import { calculateMarkerPositions } from '../utils/markerPositioning';
import 'leaflet/dist/leaflet.css';
import './KaomojiMapMarker.css';

/**
 * MAP ZOOM CONFIGURATION
 * 
 * Controls how tightly the map zooms to fit all study spot markers.
 * Adjust these values to control the zoom level and padding around markers.
 * 
 * - Lower padding = tighter zoom (closer to markers)
 * - Higher padding = more space around markers
 * 
 * RECOMMENDED VALUES:
 * - For 5-10 locations: [0.002, 0.002] (current)
 * - For 10-20 locations: [0.003, 0.003]
 * - For 20+ locations: [0.004, 0.004]
 * 
 * Format: [latPadding, lngPadding] in decimal degrees
 */
const MAP_BOUNDS_PADDING: [number, number] = [0.002, 0.002];

/**
 * Minimum zoom level (prevents zooming too far out)
 * Default: 14 (good for campus view)
 */
const MIN_ZOOM_LEVEL = 14;

/**
 * Maximum zoom level (prevents zooming too far in)
 * Default: 17 (shows building details)
 */
const MAX_ZOOM_LEVEL = 17;

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Component to handle automatic map bounds fitting
function MapBoundsFitter({ spots }: { spots: StudySpot[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (spots.length === 0) return;
    
    // Filter spots with valid coordinates
    const validSpots = spots.filter(spot => 
      spot.latitude && spot.longitude
    );
    
    if (validSpots.length === 0) return;
    
    // Calculate bounds
    const latitudes = validSpots.map(s => s.latitude);
    const longitudes = validSpots.map(s => s.longitude);
    
    const minLat = Math.min(...latitudes) - MAP_BOUNDS_PADDING[0];
    const maxLat = Math.max(...latitudes) + MAP_BOUNDS_PADDING[0];
    const minLng = Math.min(...longitudes) - MAP_BOUNDS_PADDING[1];
    const maxLng = Math.max(...longitudes) + MAP_BOUNDS_PADDING[1];
    
    // Fit map to bounds
    const bounds = L.latLngBounds(
      L.latLng(minLat, minLng),
      L.latLng(maxLat, maxLng)
    );
    
    map.fitBounds(bounds, {
      padding: [50, 50], // Additional pixel padding
      maxZoom: MAX_ZOOM_LEVEL,
      animate: true
    });
    
    // Ensure minimum zoom
    if (map.getZoom() < MIN_ZOOM_LEVEL) {
      map.setZoom(MIN_ZOOM_LEVEL);
    }
    
  }, [spots, map]);

  return null;
}

interface LeafletMapProps {
  onMapReady?: () => void;
}

interface SpotWithCheckIns extends StudySpot {
  checkIns: PopulatedCheckIn[];
}

export default function LeafletMap({ onMapReady }: LeafletMapProps) {
  // Default center (Berkeley campus) - used only for initial render
  // Actual view will be adjusted by MapBoundsFitter to show all markers
  const center = useMemo<[number, number]>(() => [37.8715, -122.2590], []);
  const [spots, setSpots] = useState<StudySpot[]>([]);
  const [spotsWithCheckIns, setSpotsWithCheckIns] = useState<SpotWithCheckIns[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<PopulatedCheckIn | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch study spots on mount
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'study_spots'));
        const spotsData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          hours: doc.data().hours,
          latitude: doc.data().latitude,
          longitude: doc.data().longitude
        } as StudySpot));
        
        setSpots(spotsData);
      } catch (error) {
        console.error('Error fetching study spots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  // Real-time check-ins listener
  useEffect(() => {
    if (spots.length === 0) return;

    const q = query(
      collection(db, 'check_ins'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Get all active check-ins
      const checkIns = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as CheckIn))
        .filter(checkIn => checkIn.expiresAt.toMillis() > Date.now());

      // Get unique user IDs
      const userIds = [...new Set(checkIns.map(c => c.userId))];
      
      // Fetch user data
      const usersMap = await getUsersData(userIds);

      // Populate check-ins with user data
      const populatedCheckIns: PopulatedCheckIn[] = checkIns.map(checkIn => ({
        ...checkIn,
        user: usersMap.get(checkIn.userId) || { username: 'Unknown', kao: '(^_^)' }
      }));

      // Group check-ins by spot
      const spotsWithCheckInsData: SpotWithCheckIns[] = spots.map(spot => ({
        ...spot,
        checkIns: populatedCheckIns.filter(c => c.spotId === spot.id)
      }));

      setSpotsWithCheckIns(spotsWithCheckInsData);
    });

    return () => unsubscribe();
  }, [spots]);

  useEffect(() => {
    if (onMapReady) {
      onMapReady();
    }
  }, [onMapReady]);

  // Handle user click on marker
  const handleUserClick = (checkIn: PopulatedCheckIn) => {
    setSelectedCheckIn(checkIn);
    setShowRequestModal(false);
  };

  // Handle send request
  const handleSendRequest = () => {
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={15}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Automatically fit map bounds to show all study spots */}
          <MapBoundsFitter spots={spots} />

          {/* Snapchat-style Kaomoji Markers */}
          {spotsWithCheckIns.map(spot => {
            // Only show spots with valid coordinates and active check-ins
            if (!spot.latitude || !spot.longitude || spot.checkIns.length === 0) {
              return null;
            }

            // Calculate positions for multiple users at same spot
            const positions = calculateMarkerPositions(spot.checkIns.length);

            return spot.checkIns.map((checkIn, index) => {
              const position = positions[index];
              
              // Create custom marker HTML with positioning
              const markerHtml = renderToStaticMarkup(
                <KaomojiMapMarker
                  checkIn={checkIn}
                  position={position}
                  onClick={handleUserClick}
                />
              );

              // Create custom DivIcon
              const customIcon = new DivIcon({
                html: markerHtml,
                className: 'kaomoji-marker-container',
                iconSize: [60, 60],
                iconAnchor: [30, 30], // Center the icon
              });

              return (
                <Marker
                  key={`${spot.id}-${checkIn.id}`}
                  position={[spot.latitude, spot.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleUserClick(checkIn),
                  }}
                />
              );
            });
          })}
        </MapContainer>
      </div>

      {/* User Detail Modal */}
      {selectedCheckIn && !showRequestModal && (
        <UserDetailModal
          checkIn={selectedCheckIn}
          isOpen={true}
          onClose={() => setSelectedCheckIn(null)}
          onSendRequest={handleSendRequest}
          isCurrentUser={auth.currentUser?.uid === selectedCheckIn.userId}
        />
      )}

      {/* Study Request Modal */}
      {selectedCheckIn && showRequestModal && (
        <StudyRequestModal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedCheckIn(null);
          }}
          checkInPost={{
            uid: selectedCheckIn.userId,
            checkInId: selectedCheckIn.id,
            spotId: selectedCheckIn.spotId,
            spotName: spots.find(s => s.id === selectedCheckIn.spotId)?.name || '',
            status: selectedCheckIn.status,
            statusNote: selectedCheckIn.statusNote,
            expiresAt: selectedCheckIn.expiresAt,
            text: '',
            date: '',
            likes: 0,
            type: 'checkin'
          } as CheckInPost}
          recipientUsername={selectedCheckIn.user?.username || 'Unknown'}
          recipientKao={selectedCheckIn.user?.kao || '(^_^)'}
          onSuccess={() => {
            setShowRequestModal(false);
            setSelectedCheckIn(null);
          }}
        />
      )}
    </>
  );
}

