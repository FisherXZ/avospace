'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckIn } from '@/types/study';
import './ActiveCheckInBanner.css';

interface ActiveCheckInData extends CheckIn {
  spotName: string;
  timeRemaining: string;
}

export default function ActiveCheckInBanner() {
  const [activeCheckIn, setActiveCheckIn] = useState<ActiveCheckInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Real-time listener for user's active check-in
    const q = query(
      collection(db, 'check_ins'),
      where('userId', '==', auth.currentUser.uid),
      where('isActive', '==', true)
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

        if (activeCheckIns.length > 0) {
          const checkIn = activeCheckIns[0];
          
          // Fetch spot name
          let spotName = 'Unknown Location';
          try {
            const spotDoc = await getDoc(doc(db, 'study_spots', checkIn.spotId));
            if (spotDoc.exists()) {
              spotName = spotDoc.data().name;
            }
          } catch (err) {
            console.error('Error fetching spot name:', err);
          }

          // Calculate time remaining
          const timeRemaining = Math.ceil((checkIn.expiresAt.toMillis() - Date.now()) / 60000);
          const hours = Math.floor(timeRemaining / 60);
          const minutes = timeRemaining % 60;
          const timeString = hours > 0 
            ? `${hours}h ${minutes}m` 
            : `${minutes}m`;

          setActiveCheckIn({
            ...checkIn,
            spotName,
            timeRemaining: timeString
          });
        } else {
          setActiveCheckIn(null);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to active check-in:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    setCheckingOut(true);
    try {
      await updateDoc(doc(db, 'check_ins', activeCheckIn.id), {
        isActive: false
      });
      setActiveCheckIn(null);
    } catch (err) {
      console.error('Error checking out:', err);
      alert('Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Don't render anything if no active check-in
  if (loading || !activeCheckIn) {
    return null;
  }

  const statusColor = activeCheckIn.status === 'open' ? 'coral' : 'sky-blue';
  const statusLabel = activeCheckIn.status === 'open' ? 'Open to study' : 'Solo study';

  return (
    <div className="active-checkin-banner">
      <div className="banner-content">
        <div className="banner-icon">📍</div>
        <div className="banner-info">
          <div className="banner-title">
            Currently at <strong>{activeCheckIn.spotName}</strong>
          </div>
          <div className="banner-details">
            <span className={`status-indicator status-${statusColor}`}>
              {statusLabel}
            </span>
            <span className="time-remaining">
              ⏱ {activeCheckIn.timeRemaining} left
            </span>
            {activeCheckIn.statusNote && (
              <span className="status-note">
                "{activeCheckIn.statusNote}"
              </span>
            )}
          </div>
        </div>
      </div>
      <button 
        className="checkout-button"
        onClick={handleCheckOut}
        disabled={checkingOut}
      >
        {checkingOut ? 'Checking out...' : 'Check Out'}
      </button>
    </div>
  );
}

