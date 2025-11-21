import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CheckInPost from '@/app/avo_study/components/CheckInPost';
import { CheckInPost as CheckInPostType } from '@/types/study';

interface PostProps {
  text?: string;
  uid?: string;
  date?: string;
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
      <div className="card-elevated p-4 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="spinner-border spinner-border-sm text-muted" role="status" />
          <span className="text-muted-soft">Loading post...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card-elevated mb-3" 
      style={{ 
        cursor: clickable && uid && uid.trim() !== '' ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onClick={handlePostClick}
    >
      <div className="p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          {/* Avatar Bubble */}
          <div 
            style={{
              minWidth: '48px',
              height: '48px',
              borderRadius: '24px',
              background: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              border: '1px solid rgba(0,0,0,0.05)',
              flexShrink: 0,
              padding: '0 12px'
            }}
          >
            {kao}
          </div>
          
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-dark">{username}</h6>
              <span className="text-muted-soft" style={{ fontSize: '0.85rem' }}>• {date}</span>
            </div>
            <div className="text-muted-soft" style={{ fontSize: '0.85rem' }}>{kao}</div>
          </div>
        </div>
        
        <p className="mb-0" style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          {text}
        </p>
      </div>
    </div>
  );
}
