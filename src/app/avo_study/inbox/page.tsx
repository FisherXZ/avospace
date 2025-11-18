'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudyRequest } from '@/types/study';
import { getUserData } from '../utils/userCache';
import './inbox.css';

interface PopulatedStudyRequest extends StudyRequest {
  fromUser?: {
    username: string;
    kao: string;
  };
  spotName?: string;
}

export default function StudyRequestInbox() {
  const router = useRouter();
  const [requests, setRequests] = useState<PopulatedStudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    // Real-time listener for study requests TO current user
    const q = query(
      collection(db, 'study_requests'),
      where('toUserId', '==', auth.currentUser.uid),
      orderBy('sentAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const requestsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data() as Omit<StudyRequest, 'id'>;
            
            // Fetch sender info
            const fromUser = await getUserData(data.fromUserId);
            
            // Fetch spot name
            let spotName = 'Unknown Location';
            try {
              const spotDoc = await getDoc(doc(db, 'study_spots', data.spotId));
              if (spotDoc.exists()) {
                spotName = spotDoc.data().name;
              }
            } catch (err) {
              console.error('Error fetching spot:', err);
            }

            return {
              id: docSnapshot.id,
              ...data,
              fromUser: fromUser || { username: 'Unknown', kao: '(^_^)' },
              spotName
            } as PopulatedStudyRequest;
          })
        );

        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to study requests:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleAccept = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'study_requests', requestId), {
        status: 'accepted',
        readAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'study_requests', requestId), {
        status: 'declined',
        readAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request');
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="inbox-loading">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="loading-text">Loading requests...</p>
      </div>
    );
  }

  return (
    <main className="inbox-page">
      <div className="container inbox-container">
        {/* Header */}
        <div className="inbox-header">
          <button 
            className="back-button"
            onClick={() => router.push('/avo_study')}
          >
            ← Back to Avo Study
          </button>
          <h2 className="inbox-title">Study Requests</h2>
          {pendingCount > 0 && (
            <span className="pending-badge">{pendingCount} pending</span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="inbox-filters">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({requests.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button 
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
          <button 
            className={`filter-tab ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Declined
          </button>
        </div>

        {/* Requests List */}
        <div className="requests-list">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No {filter !== 'all' ? filter : ''} requests</h3>
              <p>
                {filter === 'pending' 
                  ? "You don't have any pending study requests" 
                  : "When people send you study requests, they'll appear here"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className={`request-card request-${request.status}`}>
                {/* Header */}
                <div className="request-header">
                  <div 
                    className="request-user"
                    onClick={() => router.push(`/user/${request.fromUserId}`)}
                  >
                    <div className="request-kao">{request.fromUser?.kao}</div>
                    <div className="request-user-info">
                      <div className="request-username">
                        @{request.fromUser?.username}
                      </div>
                      <div className="request-meta">
                        📍 {request.spotName} · {new Date(request.sentAt.toMillis()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`request-status-badge status-${request.status}`}>
                    {request.status}
                  </div>
                </div>

                {/* Message */}
                <div className="request-message">
                  "{request.message}"
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn-decline"
                      onClick={() => handleDecline(request.id)}
                    >
                      Decline
                    </button>
                    <button 
                      className="btn-accept"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="request-accepted-message">
                    ✓ You accepted this request
                  </div>
                )}

                {request.status === 'declined' && (
                  <div className="request-declined-message">
                    ✗ You declined this request
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

