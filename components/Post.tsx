import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CheckInPost from '@/app/avo_study/components/CheckInPost';
import { CheckInPost as CheckInPostType } from '@/types/study';
import { Loader2 } from 'lucide-react';
import './Post.css';

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

interface PostProps {
  text?: string;
  uid?: string;
  date?: string;
  createdAt?: any; // Timestamp for showing exact time
  likes?: number;
  tags?: string;
  type?: 'regular' | 'checkin';
  // Check-in specific props
  checkInId?: string;
  spotId?: string;
  spotName?: string;
  status?: string;
  statusNote?: string;
  expiresAt?: any;
  // Layout options
  clickable?: boolean; // Whether the post should navigate to profile on click
}

export default function Post({ 
  text = "", 
  uid = "", 
  date = "4/11/2025", 
  createdAt,
  likes = 0, 
  tags = "", 
  type,
  checkInId,
  spotId,
  spotName,
  status,
  statusNote,
  expiresAt,
  clickable = true
}: PostProps) {
  // If this is a check-in post, render CheckInPost component
  if (type === 'checkin') {
    return <CheckInPost post={{
      text,
      uid,
      date,
      createdAt,
      likes,
      type: 'checkin',
      checkInId: checkInId!,
      spotId: spotId!,
      spotName: spotName!,
      status: status!,
      statusNote,
      expiresAt
    } as CheckInPostType} />;
  }
  
  // Regular post rendering
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kao, setKao] = useState<string>('(^ᗜ^)');
  const [username, setUsername] = useState<string>('Unknown User');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!uid || uid.trim() === '') {
          setLoading(false);
          return;
        }
        
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || 'Unknown User');
          setKao(data.kao || '(^ᗜ^)');
          setBgColor(data.bgColor || '#ffffff');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [uid]);

  const handlePostClick = () => {
    if (clickable && uid && uid.trim() !== '') {
      router.push(`/user/${uid}`);
    }
  };

  if (loading) {
    return (
      <div className="post-card post-loading">
        <Loader2 className="post-loading-spinner" size={24} />
        <span className="post-loading-text">Loading post...</span>
      </div>
    );
  }

  return (
    <div 
      className={`post-card ${clickable && uid && uid.trim() !== '' ? 'clickable' : ''}`}
      onClick={handlePostClick}
    >
      <div className="post-header">
        <div 
          className="post-avatar"
          style={{ background: bgColor }}
        >
          {kao}
        </div>
        
        <div className="post-user-info">
          <div className="post-username-row">
            <h6 className="post-username">{username}</h6>
            <span className="post-date">• {formatDateTime(date, createdAt)}</span>
          </div>
          <div className="post-kao">{kao}</div>
        </div>
      </div>
      
      <p className="post-text">{text}</p>
    </div>
  );
}
