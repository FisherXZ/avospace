'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserStats } from '@/types/study';
import { XP_TIERS, getTierByXP, getTierDisplay } from '../utils/xp';
import {
  Sprout,
  BookOpen,
  Scroll,
  Flame,
  Star,
  Crown,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import './tiers.css';

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


// Tier icon component
function TierIcon({ iconName, size = 48, color }: { iconName: string; size?: number; color: string }) {
  const iconProps = { size, strokeWidth: 2.5, style: { color } };
  
  switch (iconName) {
    case 'Sprout': return <Sprout {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'Scroll': return <Scroll {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    default: return <Sprout {...iconProps} />;
  }
}

export default function TiersPage() {
  const router = useRouter();
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    loadUserStats();
  }, [router]);

  const loadUserStats = async () => {
    if (!auth.currentUser) return;

    try {
      const statsDoc = await getDoc(doc(db, 'user_stats', auth.currentUser.uid));
      if (statsDoc.exists()) {
        setMyStats(statsDoc.data() as UserStats);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
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
          </ul>
        </aside>
        <div className="tiers-loading">
          <Loader2 className="loading-spinner" size={40} />
          <p className="loading-text">Loading tiers...</p>
        </div>
      </main>
    );
  }

  const userXP = myStats?.totalXP || 0;
  const tierDisplay = getTierDisplay(userXP);

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
        </ul>
      </aside>

      {/* Main Content */}
      <div className="tiers-page">
        <div className="container tiers-container">
          {/* Header */}
          <header className="tiers-header">
            <h1 className="tiers-title">
              <Crown size={32} strokeWidth={2.5} />
              XP Tiers & Progression
            </h1>
            <p className="tiers-subtitle">
              Earn XP through study sessions to climb the ranks
            </p>
          </header>

          {/* User Progress Card */}
          {myStats && (
            <div className="user-progress-card">
              <div className="progress-header">
                <div className="current-tier-info">
                  <TierIcon 
                    iconName={tierDisplay.tier.icon} 
                    size={40} 
                    color={tierDisplay.tier.color} 
                  />
                  <div>
                    <span className="current-tier-label">Your Current Tier</span>
                    <span 
                      className="current-tier-name"
                      style={{ color: tierDisplay.tier.color }}
                    >
                      {tierDisplay.tier.name}
                    </span>
                  </div>
                </div>
                <div className="xp-display">
                  <span className="xp-value">{userXP.toLocaleString()} XP</span>
                  <span className="coins-value">
                    {tierDisplay.coins.toLocaleString()} <img src="/avocoin.png" alt="coin" className="coin-icon" />
                  </span>
                </div>
              </div>
              
              {tierDisplay.nextTier && (
                <div className="progress-section">
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${tierDisplay.progress}%`,
                        backgroundColor: tierDisplay.tier.color 
                      }}
                    />
                  </div>
                  <div className="progress-labels">
                    <span>Progress to {tierDisplay.nextTier.name}</span>
                    <span className="xp-remaining">
                      {tierDisplay.xpToNext} XP remaining
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tiers Showcase */}
          <div className="tiers-showcase">
            {XP_TIERS.map((tier, index) => {
              const isCurrentTier = myStats && getTierByXP(myStats.totalXP).level === tier.level;
              const isUnlocked = myStats && myStats.totalXP >= tier.minXP;
              
              return (
                <div 
                  key={tier.level}
                  className={`tier-podium ${isCurrentTier ? 'current-tier' : ''} ${isUnlocked ? 'unlocked' : ''}`}
                  style={{ '--tier-index': index } as React.CSSProperties}
                >
                  <div 
                    className="tier-content"
                    style={{ backgroundColor: tier.bgColor }}
                  >
                    <div className="tier-icon-wrapper">
                      <TierIcon 
                        iconName={tier.icon} 
                        size={
                          tier.level === 'legend' ? 64 :
                          tier.level === 'master' ? 58 :
                          tier.level === 'grinder' ? 52 :
                          tier.level === 'scholar' ? 46 :
                          tier.level === 'studier' ? 42 : 38
                        } 
                        color={tier.color} 
                      />
                      {tier.level === 'legend' && (
                        <div className="legend-glow" />
                      )}
                    </div>
                    <h3 
                      className="tier-name"
                      style={{ color: tier.color }}
                    >
                      {tier.name}
                    </h3>
                    <p className="tier-requirement">
                      {tier.minXP.toLocaleString()} XP
                      {tier.maxXP !== Infinity && ` - ${tier.maxXP.toLocaleString()} XP`}
                    </p>
                    {isCurrentTier && (
                      <div className="you-badge">You are here</div>
                    )}
                  </div>
                  <div 
                    className="podium-stand"
                    style={{ 
                      height: `${tier.podiumHeight}px`,
                      background: `linear-gradient(135deg, ${tier.bgColor} 0%, ${tier.color}15 100%)`,
                      borderTop: `3px solid ${tier.color}40`
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

