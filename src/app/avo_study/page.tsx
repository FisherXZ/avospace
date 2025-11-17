'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySpot } from '@/types/study';
import StudySpotCard from './components/StudySpotCard';
import ActiveCheckInBanner from './components/ActiveCheckInBanner';
import './avo-study.css';

// Sidebar Icons
function SidebarHomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5V14h-5V21H5a1 1 0 0 1-1-1v-9.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarUsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.5 11a3.5 3.5 0 1 0-2.96-5.33"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 20.25c.8-1.8 2.64-3.25 4.5-3.25s3.7 1.45 4.5 3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 17c2 0 3.8 1.2 4.5 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarStudyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5C4 5.67 4.67 5 5.5 5h8.5a3 3 0 0 1 3 3v10.5l-4.25-2.25L8.5 18.5 4 16.25V6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AvoStudyPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<StudySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'study_spots'));
        const spotsData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          hours: doc.data().hours
        } as StudySpot));
        
        setSpots(spotsData);
      } catch (err: any) {
        console.error('Error fetching study spots:', err);
        setError(err.message || 'Failed to load study spots');
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  if (loading) {
    return (
      <div className="avo-study-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="loading-text">Loading study spots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">⚠️ Connection Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please check your Firebase connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      {/* Sidebar (desktop) */}
      <aside className="app-sidebar d-none d-md-flex">
        <ul className="app-sidebar-items mt-2">
          <li
            className="app-sidebar-item"
            onClick={() => router.push('/home')}
          >
            <span className="app-sidebar-icon">
              <SidebarHomeIcon />
            </span>
            <span className="app-sidebar-label">Home</span>
          </li>
          <li
            className="app-sidebar-item"
            onClick={() => router.push('/friends')}
          >
            <span className="app-sidebar-icon">
              <SidebarUsersIcon />
            </span>
            <span className="app-sidebar-label">Friends</span>
          </li>
          <li className="app-sidebar-item app-sidebar-item-active">
            <span className="app-sidebar-icon">
              <SidebarStudyIcon />
            </span>
            <span className="app-sidebar-label">Avo Study</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="avo-study-page">
        <div className="container avo-study-container" style={{ paddingTop: '88px' }}>
          {/* Section Header */}
          <div className="section-header">
            <div>
              <h2 className="section-title">Active Study Spots</h2>
              <p className="section-subtitle">Check in to let others know you're studying</p>
            </div>
            <button 
              className="map-view-button"
              onClick={() => router.push('/map')}
              title="View map"
            >
              🗺️ Map View
            </button>
          </div>

          {/* Active Check-In Banner */}
          <ActiveCheckInBanner />

          {/* Study Spot Cards Grid */}
          <div className="spots-grid">
            {spots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No Study Spots Yet</h3>
                <p>Check back soon for available study locations!</p>
              </div>
            ) : (
              spots.map((spot, index) => (
                <div 
                  key={spot.id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StudySpotCard spot={spot} />
                </div>
              ))
          )}
        </div>

      </div>
      </div>
    </main>
  );
}
