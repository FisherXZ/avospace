'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckIn, PopulatedCheckIn, CheckInPost } from '@/types/study';
import { getUserData } from '../utils/userCache';
import CheckInModal from './CheckInModal';
import StudyRequestModal from './StudyRequestModal';
import UserDetailModal from './UserDetailModal';
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
  const [selectedCheckIn, setSelectedCheckIn] = useState<PopulatedCheckIn | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const isOpen = isSpotOpen(spot.hours);

  const handleUserClick = (checkIn: PopulatedCheckIn) => {
    console.log('User clicked:', checkIn.user?.username);
    setSelectedCheckIn(checkIn);
  };

  const handleSendRequest = () => {
    setShowRequestModal(true);
  };

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

  return (
    <>
      <div className="card-elevated h-100 d-flex flex-column position-relative overflow-hidden group-hover-effect">
        {/* Header Section with Status Strip */}
        <div 
          className="p-4 pb-3"
          style={{ 
            background: isOpen 
              ? 'linear-gradient(to right, rgba(91, 155, 126, 0.1), rgba(255, 255, 255, 0))' 
              : 'linear-gradient(to right, rgba(0, 0, 0, 0.03), rgba(255, 255, 255, 0))' 
          }}
        >
          <div className="mb-2">
            <h3 className="h5 fw-bold mb-0 text-dark">{spot.name}</h3>
          </div>
          
          <div className="d-flex align-items-center text-muted-soft" style={{ fontSize: '0.9rem' }}>
            <span className="me-2">🕒</span>
            {spot.hours}
          </div>
        </div>

        {/* Roster / Face Scroll Section */}
        <div className="px-4 py-3 flex-grow-1">
          {loading ? (
            <div className="d-flex align-items-center gap-2 text-muted-soft">
              <div className="spinner-border spinner-border-sm" />
              <small>Checking occupancy...</small>
            </div>
          ) : checkIns.length > 0 ? (
            <div>
              <div className="d-flex justify-content-between align-items-end mb-2">
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Who's Here
                </small>
                <small className="text-success fw-medium" style={{ fontSize: '0.8rem' }}>
                  {checkIns.length} active
                </small>
              </div>
              
              {/* Horizontal Scrollable Roster */}
              <div 
                className="d-flex align-items-center gap-2 overflow-x-auto pb-2"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-medium) transparent' 
                }}
              >
                {checkIns.map((checkIn) => {
                  const isCurrentUser = auth.currentUser?.uid === checkIn.userId;
                  return (
                    <div 
                      key={checkIn.id}
                      title={checkIn.user?.username}
                      className="user-pill"
                      onClick={() => handleUserClick(checkIn)}
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: isCurrentUser ? 'var(--light-green)' : 'var(--background-subtle)',
                        border: isCurrentUser ? '1px solid var(--primary-green)' : '1px solid var(--border-subtle)',
                        color: isCurrentUser ? 'var(--forest-green)' : 'inherit',
                        fontWeight: isCurrentUser ? 600 : 'normal',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {checkIn.user?.kao || '??'}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-3 rounded bg-light border border-dashed">
              <small className="text-muted d-block mb-1">It's quiet right now</small>
              <span style={{ fontSize: '1.5rem' }}>🌱</span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 pt-0 mt-auto">
          <button 
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowModal(true)}
            disabled={!auth.currentUser}
          >
            <span>📍</span> Check In
          </button>
        </div>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        spot={spot}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* User Detail Modal */}
      {selectedCheckIn && (
        <UserDetailModal
          checkIn={selectedCheckIn}
          isOpen={!!selectedCheckIn && !showRequestModal}
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
            spotName: spot.name,
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
