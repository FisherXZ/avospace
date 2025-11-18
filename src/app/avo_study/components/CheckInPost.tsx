'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckInPost as CheckInPostType } from '@/types/study';
import { useRouter } from 'next/navigation';
import StudyRequestModal from './StudyRequestModal';
import './CheckInPost.css';

interface CheckInPostProps {
  post: CheckInPostType;
}

// Helper to get status display info
function getStatusInfo(status: string) {
  const statusMap: Record<string, { color: string; emoji: string; label: string }> = {
    'open': { color: 'coral', emoji: '🤝', label: 'Open to study' },
    'solo': { color: 'sky-blue', emoji: '🎧', label: 'Solo mode' },
    'break': { color: 'yellow', emoji: '☕', label: 'On a break' },
  };
  return statusMap[status] || statusMap['solo'];
}

export default function CheckInPost({ post }: CheckInPostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kao, setKao] = useState<string>('(^_^)');
  const [username, setUsername] = useState<string>('Unknown');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

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
    return <div className="checkin-post-loading">Loading post...</div>;
  }

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${post.uid}`);
  };

  const handleSendRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRequestModal(true);
  };

  return (
    <>
      <div className="checkin-post-card">
        {/* User Header */}
        <div className="checkin-post-header" onClick={handleUserClick}>
          <div className="checkin-post-kao">{kao}</div>
          <div className="checkin-post-user-info">
            <div className="checkin-post-username">@{username}</div>
            <div className="checkin-post-date">{post.date}</div>
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
              <span className="location-icon">📍</span>
              <span className="location-name">{post.spotName}</span>
            </div>

            {/* Status */}
            <div className="checkin-post-status-row">
              <span className={`status-badge-post status-${statusInfo.color}`}>
                {statusInfo.emoji} {statusInfo.label}
              </span>
            </div>

            {/* Send Request Button - Inline */}
            {canSendRequest && (
              <button
                className="send-request-button"
                onClick={handleSendRequest}
              >
                <span className="button-icon">📨</span>
                Send Study Request
              </button>
            )}
          </div>

          {/* Status Note */}
          {post.statusNote && (
            <div className="checkin-post-note">
              <span className="note-icon">💬</span>
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
            // Could show a success toast here
            console.log('Study request sent successfully!');
          }}
        />
      )}
    </>
  );
}

