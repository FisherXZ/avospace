'use client';

import { useRouter } from 'next/navigation';
import { Crown, Medal } from 'lucide-react';
import { LeaderboardEntry } from '@/types/study';
import { getTier } from '../utils/tiers';
import './Podium.css';

interface PodiumProps {
  entries: LeaderboardEntry[];
  metric: 'hours' | 'streak';
}

export default function Podium({ entries, metric }: PodiumProps) {
  const router = useRouter();
  
  // Need at least 1 entry to show podium
  if (entries.length === 0) {
    return null;
  }
  
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];
  
  // Get display value based on metric
  const getValue = (entry: LeaderboardEntry) => {
    if (metric === 'streak') {
      return `${entry.currentStreak} days`;
    }
    return `${entry.totalHours.toFixed(1)}h`;
  };
  
  // Dynamic font size for kaomoji
  const getDynamicFontSize = (kao: string) => {
    const len = kao.length;
    if (len <= 3) return '1.4em';
    if (len <= 5) return '1.2em';
    if (len <= 7) return '0.95em';
    return '0.75em';
  };
  
  const handleClick = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="podium-container">
      {/* Second Place - Left */}
      {second && (
        <div 
          className="podium-entry podium-second"
          onClick={() => handleClick(second.userId)}
        >
          <div className="podium-medal silver">
            <Medal size={24} strokeWidth={2.5} />
            <span className="medal-number">2</span>
          </div>
          <div className="podium-avatar">
            <span 
              className="podium-kao"
              style={{ fontSize: getDynamicFontSize(second.kao) }}
            >
              {second.kao}
            </span>
          </div>
          <div className="podium-info">
            <span className="podium-username">@{second.username}</span>
            <span className="podium-value">{getValue(second)}</span>
          </div>
          <div className="podium-stand stand-second">
            <span className="stand-rank">2</span>
          </div>
        </div>
      )}
      
      {/* First Place - Center (Tallest) */}
      {first && (
        <div 
          className="podium-entry podium-first"
          onClick={() => handleClick(first.userId)}
        >
          <div className="podium-crown">
            <Crown size={32} strokeWidth={2} />
          </div>
          <div className="podium-avatar first-place">
            <span 
              className="podium-kao"
              style={{ fontSize: getDynamicFontSize(first.kao) }}
            >
              {first.kao}
            </span>
          </div>
          <div className="podium-info">
            <span className="podium-username">@{first.username}</span>
            <span className="podium-value">{getValue(first)}</span>
            <span 
              className="podium-tier"
              style={{ color: getTier(first.totalHours).color }}
            >
              {getTier(first.totalHours).name}
            </span>
          </div>
          <div className="podium-stand stand-first">
            <span className="stand-rank">1</span>
          </div>
          <div className="first-place-glow"></div>
        </div>
      )}
      
      {/* Third Place - Right */}
      {third && (
        <div 
          className="podium-entry podium-third"
          onClick={() => handleClick(third.userId)}
        >
          <div className="podium-medal bronze">
            <Medal size={24} strokeWidth={2.5} />
            <span className="medal-number">3</span>
          </div>
          <div className="podium-avatar">
            <span 
              className="podium-kao"
              style={{ fontSize: getDynamicFontSize(third.kao) }}
            >
              {third.kao}
            </span>
          </div>
          <div className="podium-info">
            <span className="podium-username">@{third.username}</span>
            <span className="podium-value">{getValue(third)}</span>
          </div>
          <div className="podium-stand stand-third">
            <span className="stand-rank">3</span>
          </div>
        </div>
      )}
    </div>
  );
}

