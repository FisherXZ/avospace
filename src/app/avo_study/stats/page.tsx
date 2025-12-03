'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserStats, LeaderboardEntry, LeaderboardMetric, LeaderboardTimeframe } from '@/types/study';
import { getUserData } from '../utils/userCache';
import { formatHours, getOrdinalSuffix } from '../utils/statsManager';
import { 
  Flame, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy,
  Globe,
  Loader2,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import './stats.css';

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

function SidebarMapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <polygon 
        points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="1.7" />
      <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function SidebarStatsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}


function SidebarUsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarTiersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M12 2L9 9l-2 13h10l-2-13-3-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [studySpots, setStudySpots] = useState<any[]>([]);
  
  // Filters
  const [selectedSpot, setSelectedSpot] = useState<string>('all');

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    loadStudySpots();
    loadLeaderboard();
  }, [selectedSpot, router]);

  const loadStudySpots = async () => {
    try {
      const spotsSnapshot = await getDocs(collection(db, 'study_spots'));
      const spots = spotsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setStudySpots(spots);
    } catch (err) {
      console.error('Error loading spots:', err);
    }
  };

  const loadLeaderboard = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Fetch all user stats
      const statsSnapshot = await getDocs(collection(db, 'user_stats'));
      
      // Convert to leaderboard entries
      const entries: LeaderboardEntry[] = await Promise.all(
        statsSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data() as UserStats;
          const user = await getUserData(data.userId);
          
          // Get spot name for favorite spot
          let favoriteSpotName = 'N/A';
          if (data.favoriteSpot) {
            try {
              const spotDoc = await getDoc(doc(db, 'study_spots', data.favoriteSpot));
              if (spotDoc.exists()) {
                favoriteSpotName = spotDoc.data().name;
              }
            } catch (err) {
              console.error('Error fetching spot:', err);
            }
          }

          return {
            userId: data.userId,
            username: user?.username || 'Unknown',
            kao: user?.kao || '(^_^)',
            totalSessions: data.totalSessions,
            totalHours: data.totalHours,
            currentStreak: data.currentStreak,
            favoriteSpot: data.favoriteSpot,
            favoriteSpotName,
            spotStats: data.spotStats || {},
          };
        })
      );

      // Filter by selected spot if not "all"
      let filteredEntries = entries;
      if (selectedSpot !== 'all') {
        filteredEntries = entries.filter(entry => {
          // Check if user has sessions at this spot
          return entry.spotStats && entry.spotStats[selectedSpot];
        }).map(entry => {
          // Replace total hours with hours at selected spot
          const spotData = entry.spotStats[selectedSpot];
          return {
            ...entry,
            totalHours: spotData ? spotData.totalMinutes / 60 : 0,
            totalSessions: spotData ? spotData.sessionCount : 0,
          };
        });
      }

      // Sort by hours (descending)
      filteredEntries.sort((a, b) => b.totalHours - a.totalHours);

      // Add ranks
      filteredEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaders(filteredEntries);

      // Load current user's stats
      const myStatsDoc = await getDoc(doc(db, 'user_stats', auth.currentUser.uid));
      if (myStatsDoc.exists()) {
        setMyStats(myStatsDoc.data() as UserStats);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="app-shell">
        {/* Sidebar (desktop) */}
        <aside className="app-sidebar d-none d-md-flex">
          <ul className="app-sidebar-items mt-2">
            <li className="app-sidebar-item" onClick={() => router.push('/home')}>
              <span className="app-sidebar-icon"><SidebarHomeIcon /></span>
              <span className="app-sidebar-label">Home</span>
            </li>
            <li className="app-sidebar-item" onClick={() => router.push('/avo_study')}>
              <span className="app-sidebar-icon"><SidebarStudyIcon /></span>
              <span className="app-sidebar-label">Avo Study</span>
            </li>
            <li className="app-sidebar-item" onClick={() => router.push('/map')}>
              <span className="app-sidebar-icon"><SidebarMapIcon /></span>
              <span className="app-sidebar-label">Map</span>
            </li>
            <li className="app-sidebar-item app-sidebar-item-active">
              <span className="app-sidebar-icon"><SidebarStatsIcon /></span>
              <span className="app-sidebar-label">Statistics</span>
            </li>
            <li className="app-sidebar-item" onClick={() => router.push('/avo_study/tiers')}>
              <span className="app-sidebar-icon"><SidebarTiersIcon /></span>
              <span className="app-sidebar-label">Tiers</span>
            </li>
          </ul>
        </aside>
        <div className="stats-loading">
          <Loader2 className="loading-spinner" size={40} />
          <p className="loading-text">Loading statistics...</p>
        </div>
      </main>
    );
  }

  // Top 5 for table display
  const topFive = leaders.slice(0, 5);

  // Current user's entry
  const myEntry = leaders.find(e => e.userId === auth.currentUser?.uid);

  return (
    <main className="app-shell">
      {/* Sidebar (desktop) */}
      <aside className="app-sidebar d-none d-md-flex">
        <ul className="app-sidebar-items mt-2">
          <li className="app-sidebar-item" onClick={() => router.push('/home')}>
            <span className="app-sidebar-icon"><SidebarHomeIcon /></span>
            <span className="app-sidebar-label">Home</span>
          </li>
          <li className="app-sidebar-item" onClick={() => router.push('/avo_study')}>
            <span className="app-sidebar-icon"><SidebarStudyIcon /></span>
            <span className="app-sidebar-label">Avo Study</span>
          </li>
          <li className="app-sidebar-item" onClick={() => router.push('/map')}>
            <span className="app-sidebar-icon"><SidebarMapIcon /></span>
            <span className="app-sidebar-label">Map</span>
          </li>
          <li className="app-sidebar-item app-sidebar-item-active">
            <span className="app-sidebar-icon"><SidebarStatsIcon /></span>
            <span className="app-sidebar-label">Statistics</span>
          </li>
          <li className="app-sidebar-item" onClick={() => router.push('/avo_study/tiers')}>
            <span className="app-sidebar-icon"><SidebarTiersIcon /></span>
            <span className="app-sidebar-label">Tiers</span>
          </li>
        </ul>
      </aside>
      
      {/* Main Content */}
      <div className="stats-page">
        <div className="container stats-container">
          {/* Header */}
          <header className="stats-header">
            <h1 className="stats-title">
              <BarChart3 size={28} strokeWidth={2.5} />
              Study Statistics
            </h1>
            <div className="stats-header-actions">
              <button 
                className="leaderboard-cta"
                onClick={() => router.push('/avo_study/tiers')}
              >
                <Trophy size={18} />
                <span>Tiers</span>
              </button>
              <button 
                className="leaderboard-cta"
                onClick={() => router.push('/avo_study/leaderboard')}
              >
                <Trophy size={18} />
                <span>Leaderboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </header>

        {/* My Stats Overview */}
        {myStats && (
          <div className="my-stats-card">
            <h3 className="card-title">Your Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <Flame className="stat-icon" size={24} strokeWidth={2} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{myStats.currentStreak}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <Calendar className="stat-icon" size={24} strokeWidth={2} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{myStats.totalSessions}</div>
                  <div className="stat-label">Sessions</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <Clock className="stat-icon" size={24} strokeWidth={2} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{myStats.totalHours.toFixed(1)}h</div>
                  <div className="stat-label">Total Hours</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon-wrapper">
                  <MapPin className="stat-icon" size={24} strokeWidth={2} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {myEntry?.favoriteSpotName?.split(' ')[0] || 'N/A'}
                  </div>
                  <div className="stat-label">Top Location</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Spot Filter */}
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label className="filter-label">Filter by Location</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedSpot === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSpot('all')}
              >
                <Globe size={18} strokeWidth={2} />
                <span>All Locations</span>
              </button>
              {studySpots.map(spot => (
                <button
                  key={spot.id}
                  className={`filter-btn ${selectedSpot === spot.id ? 'active' : ''}`}
                  onClick={() => setSelectedSpot(spot.id)}
                >
                  <MapPin size={18} strokeWidth={2} />
                  <span>{spot.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <div className="leaderboard-header">
            <Trophy className="header-icon" size={28} strokeWidth={2.5} />
            <h3 className="leaderboard-title">
              Leaderboard
              {selectedSpot !== 'all' && (
                <span className="spot-subtitle">
                  · {studySpots.find(s => s.id === selectedSpot)?.name}
                </span>
              )}
            </h3>
          </div>

          {leaders.length === 0 ? (
            <div className="empty-state">
              <BarChart3 className="empty-icon" size={64} strokeWidth={1.5} />
              <h4>No Data Available</h4>
              <p>Complete study sessions to see leaderboard rankings</p>
            </div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="col-rank">RANK</th>
                    <th className="col-student">STUDENT</th>
                    <th className="col-hours">TOTAL HOURS</th>
                  </tr>
                </thead>
                <tbody>
                  {topFive.map((entry, index) => {
                    const isCurrentUser = entry.userId === auth.currentUser?.uid;
                    let rankDisplay = '';
                    
                    if (index === 0) rankDisplay = '🥇';
                    else if (index === 1) rankDisplay = '🥈';
                    else if (index === 2) rankDisplay = '🥉';
                    else rankDisplay = `#${entry.rank}`;
                    
                    // Dynamic font size based on kaomoji length (like MapUserAvatar)
                    const getDynamicFontSize = (kao: string) => {
                      const len = kao.length;
                      if (len <= 3) return '1.2em';
                      if (len <= 5) return '1em';
                      if (len <= 7) return '0.8em';
                      return '0.65em';
                    };
                    
                    return (
                      <tr 
                        key={entry.userId} 
                        className={`table-row ${isCurrentUser ? 'current-user-row' : ''}`}
                        onClick={() => router.push(`/user/${entry.userId}`)}
                      >
                        <td className="col-rank">
                          <span className="rank-badge">{rankDisplay}</span>
                        </td>
                        <td className="col-student">
                          <div className="student-info">
                            <span 
                              className="student-kao"
                              style={{ fontSize: getDynamicFontSize(entry.kao) }}
                            >
                              {entry.kao}
                            </span>
                            <span className="student-name">
                              @{entry.username}
                              {isCurrentUser && <span className="you-badge-inline">You</span>}
                            </span>
                          </div>
                        </td>
                        <td className="col-hours">
                          <span className="hours-value">{entry.totalHours.toFixed(1)}h</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </main>
  );
}
