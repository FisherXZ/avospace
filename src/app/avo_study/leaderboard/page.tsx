'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserStats, LeaderboardEntry } from '@/types/study';
import { getUserData } from '../utils/userCache';
import { getTier, getTierDisplay, TIERS } from '../utils/tiers';
import { getEarnedBadges } from '../utils/badges';
import Podium from '../components/Podium';
import { 
  Trophy,
  Clock,
  Flame,
  MapPin,
  Loader2,
  ChevronDown,
  Sprout,
  BookOpen,
  Scroll,
  Star,
  Crown,
  ArrowRight,
} from 'lucide-react';
import './leaderboard.css';

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

// Tier icon component
function TierIcon({ tier, size = 16 }: { tier: ReturnType<typeof getTier>, size?: number }) {
  const iconProps = { size, strokeWidth: 2, style: { color: tier.color } };
  
  switch (tier.icon) {
    case 'Sprout': return <Sprout {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'Scroll': return <Scroll {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    default: return <Sprout {...iconProps} />;
  }
}

type LeaderboardTab = 'hours' | 'streak' | 'location';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [studySpots, setStudySpots] = useState<{ id: string; name: string }[]>([]);
  
  // Filters
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('hours');
  const [selectedSpot, setSelectedSpot] = useState<string>('all');
  const [showSpotDropdown, setShowSpotDropdown] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    loadStudySpots();
    loadLeaderboard();
  }, [activeTab, selectedSpot, router]);

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

      // Filter and sort based on active tab
      let filteredEntries = [...entries];
      
      if (activeTab === 'location' && selectedSpot !== 'all') {
        filteredEntries = entries.filter(entry => {
          return entry.spotStats && entry.spotStats[selectedSpot];
        }).map(entry => {
          const spotData = entry.spotStats![selectedSpot];
          return {
            ...entry,
            totalHours: spotData ? spotData.totalMinutes / 60 : 0,
            totalSessions: spotData ? spotData.sessionCount : 0,
          };
        });
      }

      // Sort based on metric
      if (activeTab === 'streak') {
        filteredEntries.sort((a, b) => b.currentStreak - a.currentStreak);
      } else {
        filteredEntries.sort((a, b) => b.totalHours - a.totalHours);
      }

      // Add ranks
      filteredEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Find current user's rank
      const userRank = filteredEntries.findIndex(e => e.userId === auth.currentUser?.uid);
      if (userRank !== -1) {
        setMyRank(userRank + 1);
      } else {
        setMyRank(null);
      }

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

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Dynamic font size for kaomoji
  const getDynamicFontSize = (kao: string) => {
    const len = kao.length;
    if (len <= 3) return '1.1em';
    if (len <= 5) return '0.95em';
    if (len <= 7) return '0.8em';
    return '0.65em';
  };

  if (loading) {
    return (
      <main className="app-shell">
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
            <li className="app-sidebar-item" onClick={() => router.push('/avo_study/stats')}>
              <span className="app-sidebar-icon"><SidebarStatsIcon /></span>
              <span className="app-sidebar-label">Statistics</span>
            </li>
            <li className="app-sidebar-item" onClick={() => router.push('/avo_study/tiers')}>
              <span className="app-sidebar-icon"><SidebarTiersIcon /></span>
              <span className="app-sidebar-label">Tiers</span>
            </li>
          </ul>
        </aside>
        <div className="leaderboard-loading">
          <Loader2 className="loading-spinner" size={40} />
          <p className="loading-text">Loading leaderboard...</p>
        </div>
      </main>
    );
  }

  const topThree = leaders.slice(0, 3);
  const restOfLeaders = leaders.slice(3);
  const myEntry = leaders.find(e => e.userId === auth.currentUser?.uid);
  const tierDisplay = myStats ? getTierDisplay(myStats.totalHours) : null;
  const earnedBadges = myStats ? getEarnedBadges(myStats) : [];

  return (
    <main className="app-shell">
      {/* Sidebar */}
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
          <li className="app-sidebar-item" onClick={() => router.push('/avo_study/stats')}>
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
      <div className="leaderboard-page">
        <div className="container leaderboard-container">
          {/* Header */}
          <header className="leaderboard-header">
            <div className="header-title-row">
              <Trophy className="header-icon" size={32} strokeWidth={2.5} />
              <h1 className="leaderboard-title">Leaderboard</h1>
            </div>
          </header>

          {/* Personal Stats Card */}
          {myStats && tierDisplay && (
            <div className="my-rank-card">
              <div className="rank-card-header">
                <div className="rank-position">
                  <span className="rank-label">Your Rank</span>
                  <span className="rank-value">{myRank ? getOrdinalSuffix(myRank) : '—'}</span>
                </div>
                <div className="tier-display">
                  <div 
                    className="tier-badge"
                    style={{ 
                      backgroundColor: tierDisplay.tier.bgColor,
                      borderColor: tierDisplay.tier.color 
                    }}
                  >
                    <TierIcon tier={tierDisplay.tier} size={18} />
                    <span style={{ color: tierDisplay.tier.color }}>{tierDisplay.tier.name}</span>
                  </div>
                </div>
              </div>
              
              {tierDisplay.nextTier && (
                <div className="tier-progress-section">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${tierDisplay.progress}%`,
                        backgroundColor: tierDisplay.tier.color 
                      }}
                    />
                  </div>
                  <div className="progress-labels">
                    <span className="progress-current">{myStats.totalHours.toFixed(1)}h</span>
                    <span className="progress-next">
                      <ArrowRight size={14} />
                      {tierDisplay.nextTier.minHours}h for {tierDisplay.nextTier.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="quick-stats">
                <div className="quick-stat">
                  <Clock size={16} />
                  <span>{myStats.totalHours.toFixed(1)}h</span>
                </div>
                <div className="quick-stat">
                  <Flame size={16} />
                  <span>{myStats.currentStreak} day{myStats.currentStreak !== 1 ? 's' : ''}</span>
                </div>
                {earnedBadges.length > 0 && (
                  <div className="quick-stat badges-count">
                    <Trophy size={16} />
                    <span>{earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="leaderboard-tabs">
            <button
              className={`tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
              onClick={() => { setActiveTab('hours'); setSelectedSpot('all'); }}
            >
              <Clock size={18} />
              <span>Hours</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
              onClick={() => { setActiveTab('streak'); setSelectedSpot('all'); }}
            >
              <Flame size={18} />
              <span>Streak</span>
            </button>
            <div className="location-tab-wrapper">
              <button
                className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('location');
                  setShowSpotDropdown(!showSpotDropdown);
                }}
              >
                <MapPin size={18} />
                <span>
                  {activeTab === 'location' && selectedSpot !== 'all' 
                    ? studySpots.find(s => s.id === selectedSpot)?.name || 'Location'
                    : 'Location'
                  }
                </span>
                <ChevronDown size={16} className={`dropdown-arrow ${showSpotDropdown ? 'open' : ''}`} />
              </button>
              
              {showSpotDropdown && activeTab === 'location' && (
                <div className="spot-dropdown">
                  <button
                    className={`spot-option ${selectedSpot === 'all' ? 'active' : ''}`}
                    onClick={() => { setSelectedSpot('all'); setShowSpotDropdown(false); }}
                  >
                    All Locations
                  </button>
                  {studySpots.map(spot => (
                    <button
                      key={spot.id}
                      className={`spot-option ${selectedSpot === spot.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSpot(spot.id); setShowSpotDropdown(false); }}
                    >
                      {spot.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Podium */}
          {leaders.length > 0 && (
            <Podium 
              entries={topThree} 
              metric={activeTab === 'streak' ? 'streak' : 'hours'} 
            />
          )}

          {/* Leaderboard List */}
          {leaders.length === 0 ? (
            <div className="empty-state">
              <Trophy className="empty-icon" size={64} strokeWidth={1.5} />
              <h4>No Rankings Yet</h4>
              <p>Complete study sessions to appear on the leaderboard</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {restOfLeaders.map((entry) => {
                const isCurrentUser = entry.userId === auth.currentUser?.uid;
                const entryTier = getTier(entry.totalHours);
                
                return (
                  <div 
                    key={entry.userId}
                    className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                    onClick={() => router.push(`/user/${entry.userId}`)}
                  >
                    <div className="row-rank">
                      <span className="rank-number">#{entry.rank}</span>
                    </div>
                    
                    <div className="row-user">
                      <div className="user-avatar">
                        <span 
                          className="user-kao"
                          style={{ fontSize: getDynamicFontSize(entry.kao) }}
                        >
                          {entry.kao}
                        </span>
                      </div>
                      <div className="user-info">
                        <div className="user-name-row">
                          <span className="user-name">@{entry.username}</span>
                          {isCurrentUser && <span className="you-badge">You</span>}
                        </div>
                        <div className="user-tier">
                          <TierIcon tier={entryTier} size={12} />
                          <span style={{ color: entryTier.color }}>{entryTier.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row-stats">
                      <span className="primary-stat">
                        {activeTab === 'streak' 
                          ? `${entry.currentStreak} days`
                          : `${entry.totalHours.toFixed(1)}h`
                        }
                      </span>
                      <span className="secondary-stat">
                        {entry.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Show current user if not in visible list */}
              {myEntry && myRank && myRank > 3 && !restOfLeaders.find(e => e.userId === auth.currentUser?.uid) && (
                <>
                  <div className="list-divider">
                    <span>•••</span>
                  </div>
                  <div 
                    className="leaderboard-row current-user highlighted"
                    onClick={() => router.push(`/user/${myEntry.userId}`)}
                  >
                    <div className="row-rank">
                      <span className="rank-number">#{myRank}</span>
                    </div>
                    
                    <div className="row-user">
                      <div className="user-avatar">
                        <span 
                          className="user-kao"
                          style={{ fontSize: getDynamicFontSize(myEntry.kao) }}
                        >
                          {myEntry.kao}
                        </span>
                      </div>
                      <div className="user-info">
                        <div className="user-name-row">
                          <span className="user-name">@{myEntry.username}</span>
                          <span className="you-badge">You</span>
                        </div>
                        <div className="user-tier">
                          <TierIcon tier={getTier(myEntry.totalHours)} size={12} />
                          <span style={{ color: getTier(myEntry.totalHours).color }}>
                            {getTier(myEntry.totalHours).name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row-stats">
                      <span className="primary-stat">
                        {activeTab === 'streak' 
                          ? `${myEntry.currentStreak} days`
                          : `${myEntry.totalHours.toFixed(1)}h`
                        }
                      </span>
                      <span className="secondary-stat">
                        {myEntry.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

