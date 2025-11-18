'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckIn, PopulatedCheckIn } from '@/types/study';
import { getUserData } from '../utils/userCache';
import CheckInModal from './CheckInModal';
import CheckInItem from './CheckInItem';
import './StudySpotCard.css';

interface StudySpotCardProps {
  spot: StudySpot;
}

// Helper function to check if spot is currently open
function isSpotOpen(hours: string): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight
  
  // Parse hours string (e.g., "8:00 AM - 12:00 AM")
  const match = hours.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return true; // Default to open if can't parse
  
  let [_, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
  
  // Convert to 24-hour format
  let start24 = parseInt(startHour);
  if (startPeriod.toUpperCase() === 'PM' && start24 !== 12) start24 += 12;
  if (startPeriod.toUpperCase() === 'AM' && start24 === 12) start24 = 0;
  
  let end24 = parseInt(endHour);
  if (endPeriod.toUpperCase() === 'PM' && end24 !== 12) end24 += 12;
  if (endPeriod.toUpperCase() === 'AM' && end24 === 12) end24 = 0;
  
  const startMinutes = start24 * 60 + parseInt(startMin);
  let endMinutes = end24 * 60 + parseInt(endMin);
  
  // Handle cases where closing time is after midnight (e.g., 12:00 AM)
  if (endMinutes < startMinutes) {
    return currentTime >= startMinutes || currentTime < endMinutes;
  }
  
  return currentTime >= startMinutes && currentTime < endMinutes;
}

export default function StudySpotCard({ spot }: StudySpotCardProps) {
  const [checkIns, setCheckIns] = useState<PopulatedCheckIn[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const isOpen = isSpotOpen(spot.hours);

  // Real-time listener for active check-ins at this spot
  useEffect(() => {
    const q = query(
      collection(db, 'check_ins'),
      where('spotId', '==', spot.id),
      where('isActive', '==', true),
      orderBy('startedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Filter out expired check-ins
        const activeCheckIns = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as CheckIn))
          .filter(checkIn => 
            checkIn.expiresAt.toMillis() > Date.now()
          );

        // Fetch user data for all check-ins
        const populatedCheckIns = await Promise.all(
          activeCheckIns.map(async (checkIn) => {
            const userData = await getUserData(checkIn.userId);
            return {
              ...checkIn,
              user: userData || { username: 'Unknown', kao: '(^_^)' }
            } as PopulatedCheckIn;
          })
        );

        setCheckIns(populatedCheckIns);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to check-ins:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [spot.id]);

  const openCount = checkIns.filter(c => c.status === 'open').length;

  return (
    <>
      <div className="study-spot-card">
        {/* Card Header - Compact */}
        <div className="card-header-section">
          <div className="spot-name-row">
            <h3 className="spot-name">{spot.name}</h3>
            <div className={`location-badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
              📍 {isOpen ? 'Open' : 'Closed'}
            </div>
            <div className="spot-hours">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="clock-icon">
                <path d="M8 0.5C3.86 0.5 0.5 3.86 0.5 8C0.5 12.14 3.86 15.5 8 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 8 0.5ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="currentColor"/>
                <path d="M8.5 4.5H7.25V8.75L10.875 10.875L11.5 9.8625L8.5 8.125V4.5Z" fill="currentColor"/>
              </svg>
              <span>{spot.hours}</span>
            </div>
          </div>
          {checkIns.length > 0 && (
            <div className="spot-count">
              <span className="count-badge">
                {checkIns.length} studying
              </span>
            </div>
          )}
        </div>

        {/* Roster Section */}
        <div className="roster-section">
          {loading ? (
            <div className="roster-loading">
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="loading-text">Loading roster...</span>
            </div>
          ) : checkIns.length === 0 ? (
            <div className="roster-empty">
              <div className="empty-roster-icon">
                <img src="/avocado-icon.png" alt="No avocado" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <p>no avocado found here</p>
              <span className="be-first-badge">Be the first!</span>
            </div>
          ) : (
            <div className="roster-list">
              {checkIns.map(checkIn => (
                <CheckInItem key={checkIn.id} checkIn={checkIn} />
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="card-footer-section">
          <button 
            className="check-in-button"
            onClick={() => setShowModal(true)}
            disabled={!auth.currentUser}
          >
            <span className="button-icon">✓</span>
            <span>Check In Here</span>
          </button>
          {!auth.currentUser && (
            <small className="text-muted text-center d-block mt-2">
              Sign in to check in
            </small>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        spot={spot}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
