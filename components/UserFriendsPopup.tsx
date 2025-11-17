'use client';

import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type UserFriendsPopupRef = {
  open: () => void;
  close: () => void;
};

interface Friend {
  uid: string;
  username: string;
  kao: string;
}

type UserFriendsPopupProps = {
  targetUserId: string;
  currentUser?: User | null;
};

const UserFriendsPopup = forwardRef<UserFriendsPopupRef, UserFriendsPopupProps>(function UserFriendsPopup(
  { targetUserId, currentUser },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  useEffect(() => {
    const fetchFriends = async () => {
      if (!targetUserId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get the target user's friends list
        const userDocRef = doc(db, "users", targetUserId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          setFriends([]);
          setUsername('Unknown User');
          return;
        }
        
        const userData = userDoc.data();
        const friendsList = userData.friends || [];
        setUsername(userData.username || 'Unknown User');
        
        if (friendsList.length === 0) {
          setFriends([]);
          return;
        }
        
        // Fetch friend details for each friend ID
        const friendsData: Friend[] = [];
        for (const friendId of friendsList) {
          try {
            const friendDocRef = doc(db, "users", friendId);
            const friendDoc = await getDoc(friendDocRef);
            
            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              friendsData.push({
                uid: friendId,
                username: friendData.username || 'Unknown User',
                kao: friendData.kao || '(^ᗜ^)'
              });
            }
          } catch (err) {
            console.error(`Error fetching friend ${friendId}:`, err);
          }
        }
        
        setFriends(friendsData);
      } catch (err: any) {
        console.error('Error fetching friends:', err);
        setError(err?.message || 'Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [targetUserId, isOpen]);

  const handleFriendClick = (friend: Friend) => {
    router.push(`/user/${friend.uid}`);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1050 }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded shadow p-4"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 500px)',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{username}'s Friends</h5>
          <button
            className="btn-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          ></button>
        </div>
        
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}
        
        {!loading && !error && friends.length === 0 && (
          <div className="text-center py-4 text-muted">
            <p>{username} doesn't have any friends yet.</p>
          </div>
        )}
        
        {!loading && !error && friends.length > 0 && (
          <div className="list-group">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="list-group-item list-group-item-action d-flex align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => handleFriendClick(friend)}
              >
                <div className="me-3" style={{ fontSize: '1.5rem' }}>
                  {friend.kao}
                </div>
                <div>
                  <div className="fw-bold">{friend.username}</div>
                  <small className="text-muted">Click to view profile</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default UserFriendsPopup;