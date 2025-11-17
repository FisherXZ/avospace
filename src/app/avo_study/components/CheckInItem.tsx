'use client';

import { useRouter } from 'next/navigation';
import { PopulatedCheckIn, CheckInStatus } from '@/types/study';
import './CheckInItem.css';

interface CheckInItemProps {
  checkIn: PopulatedCheckIn;
}

// Helper function to get status display info
function getStatusInfo(status: CheckInStatus) {
  const statusMap = {
    'open': { color: 'coral', label: 'Open', emoji: '🤝' },
    'solo': { color: 'sky-blue', label: 'Solo', emoji: '🎧' },
    'break': { color: 'yellow', label: 'Break', emoji: '☕' },
    'sos': { color: 'red', label: 'SOS', emoji: '🆘' },
    'allnighter': { color: 'purple', label: 'All-nighter', emoji: '🌙' },
    'procrastinating': { color: 'orange', label: 'Procrastinating', emoji: '☕' },
    'cram': { color: 'green', label: 'Cram', emoji: '📚' },
  };
  return statusMap[status] || statusMap['solo'];
}

/**
 * CheckInItem Component
 * 
 * Displays an individual user's check-in with:
 * - User's kaomoji avatar
 * - Status badge (Open/Solo/Break/SOS/etc.)
 * - Click to view user profile
 */
export default function CheckInItem({ checkIn }: CheckInItemProps) {
  const router = useRouter();
  const statusInfo = getStatusInfo(checkIn.status);
  
  const handleClick = () => {
    if (checkIn.userId) {
      router.push(`/user/${checkIn.userId}`);
    }
  };
  
  return (
    <div 
      className="check-in-item" 
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      title={`View ${checkIn.user?.username || 'user'}'s profile`}
    >
      {/* Kaomoji Avatar */}
      <div className="check-in-kaomoji">
        {checkIn.user?.kao || '(^_^)'}
      </div>

      {/* Status Badge */}
      <span className={`status-badge status-${statusInfo.color}`}>
        {statusInfo.emoji} {statusInfo.label}
      </span>
    </div>
  );
}

