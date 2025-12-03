'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckInPost as CheckInPostType } from '@/types/study';
import { useRouter } from 'next/navigation';
import StudyRequestModal from './StudyRequestModal';
import { MapPin, Users, Headphones, Coffee, MessageSquare, Send, Loader2, Check } from 'lucide-react';
import './CheckInPost.css';

interface CheckInPostProps {
  post: CheckInPostType;
}

// Helper to get status display info
function getStatusInfo(status: string) {
  const statusMap: Record<string, { variant: string; label: string; Icon: typeof Users }> = {
    'open': { variant: 'open', label: 'Open to study', Icon: Users },
    'solo': { variant: 'solo', label: 'Solo mode', Icon: Headphones },
    'break': { variant: 'break', label: 'On a break', Icon: Coffee },
  };
  return statusMap[status] || statusMap['solo'];
}

// Helper to format date and time
function formatDateTime(dateString: string, createdAt?: any): string {
  // If we have a createdAt timestamp, use it to add time
  if (createdAt && createdAt.toDate) {
    const date = createdAt.toDate();
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${dateString} • ${timeString}`;
  }
  // Fallback to just the date string
  return dateString;
}

export default function CheckInPost({ post }: CheckInPostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kao, setKao] = useState<string>('(^_^)');
  const [username, setUsername] = useState<string>('Unknown');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const statusInfo = getStatusInfo(post.status);
  const isOwnPost = auth.currentUser?.uid === post.uid;
  const canSendRequest = !isOwnPost && post.status === 'open' && !isExpired;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userRef = doc(db, "users", post.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username);
          setKao(data.kao);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [post.uid]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check if check-in has expired
  useEffect(() => {
    const checkExpiry = () => {
      if (post.expiresAt && post.expiresAt.toMillis() <= Date.now()) {
        setIsExpired(true);
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [post.expiresAt]);

  if (loading) {
    return (
      <div className="checkin-post-loading">
        <Loader2 size={20} className="loading-spinner" />
        <span>Loading post...</span>
      </div>
    );
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${post.uid}`);
  };

  const handleSendRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRequestModal(true);
  };

  const StatusIcon = statusInfo.Icon;

  return (
    <>
      <div className="checkin-post-card">
        {/* User Header */}
        <div className="checkin-post-header" onClick={handleUserClick}>
          <div className="checkin-post-kao">{kao}</div>
          <div className="checkin-post-user-info">
            <div className="checkin-post-username">@{username}</div>
            <div className="checkin-post-date">{formatDateTime(post.date, post.createdAt)}</div>
          </div>
          {isExpired && (
            <div className="checkin-expired-badge">Ended</div>
          )}
        </div>

        {/* Check-in Content */}
        <div className="checkin-post-content">
          {/* Location + Status + Request Button Row */}
          <div className="checkin-post-info-row">
            {/* Location */}
            <div className="checkin-post-location">
              <MapPin size={18} strokeWidth={2} className="location-icon" />
              <span className="location-name">{post.spotName}</span>
            </div>

            {/* Status */}
            <div className={`status-badge-post status-${statusInfo.variant}`}>
              <StatusIcon size={16} strokeWidth={2} className="status-icon" />
              <span>{statusInfo.label}</span>
            </div>

            {/* Send Request Button - Inline */}
            {canSendRequest && (
              <button
                className="send-request-button"
                onClick={handleSendRequest}
              >
                <Send size={16} strokeWidth={2} />
                <span>Send Study Request</span>
              </button>
            )}
          </div>

          {/* Status Note */}
          {post.statusNote && (
            <div className="checkin-post-note">
              <MessageSquare size={16} strokeWidth={2} className="note-icon" />
              <span className="note-text">"{post.statusNote}"</span>
            </div>
          )}

          {isExpired && (
            <div className="checkin-expired-message">
              This check-in has ended
            </div>
          )}
        </div>
      </div>

      {/* Study Request Modal */}
      {canSendRequest && (
        <StudyRequestModal
          checkInPost={post}
          recipientUsername={username}
          recipientKao={kao}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setToast(`Request sent to @${username}`);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification toast-success">
          <Check size={18} strokeWidth={2.5} />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}

