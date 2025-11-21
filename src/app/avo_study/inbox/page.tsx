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
  toUser?: {
    username: string;
    kao: string;
  };
  spotName?: string;
}

export default function StudyRequestInbox() {
  const router = useRouter();
  const [requests, setRequests] = useState<PopulatedStudyRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PopulatedStudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Real-time listener for sent requests (FROM current user)
  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    const q = query(
      collection(db, 'study_requests'),
      where('fromUserId', '==', auth.currentUser.uid),
      orderBy('sentAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const requestsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data() as Omit<StudyRequest, 'id'>;
            
            // Fetch recipient info
            const toUser = await getUserData(data.toUserId);
            
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
              toUser: toUser || { username: 'Unknown', kao: '(^_^)' },
              spotName
            } as PopulatedStudyRequest;
          })
        );

        setSentRequests(requestsData);
      },
      (error) => {
        console.error('Error listening to sent requests:', error);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAccept = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      await updateDoc(doc(db, 'study_requests', requestId), {
        status: 'accepted',
        readAt: Timestamp.now()
      });
      
      // Show success toast
      if (request?.fromUser) {
        setToast({
          message: `✓ Accepted! Studying with @${request.fromUser.username}`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      setToast({
        message: 'Failed to accept request',
        type: 'error'
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'study_requests', requestId), {
        status: 'declined',
        readAt: Timestamp.now()
      });
      
      setToast({
        message: 'Request declined',
        type: 'success'
      });
    } catch (err) {
      console.error('Error declining request:', err);
      setToast({
        message: 'Failed to decline request',
        type: 'error'
      });
    }
  };

  // Use appropriate request list based on tab
  const currentRequests = tab === 'received' ? requests : sentRequests;
  
  const filteredRequests = filter === 'all' 
    ? currentRequests 
    : currentRequests.filter(r => r.status === filter);

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
          <h2 className="inbox-title">AvoMail</h2>
          {pendingCount > 0 && (
            <span className="pending-badge">{pendingCount} pending</span>
          )}
        </div>

        {/* Main Tabs: Received / Sent */}
        <div className="inbox-main-tabs">
          <button 
            className={`main-tab ${tab === 'received' ? 'active' : ''}`}
            onClick={() => {
              setTab('received');
              setFilter('all');
            }}
          >
            📬 Received ({requests.length})
          </button>
          <button 
            className={`main-tab ${tab === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setTab('sent');
              setFilter('all');
            }}
          >
            📤 Sent ({sentRequests.length})
          </button>
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
                {tab === 'received' 
                  ? filter === 'pending'
                    ? "You don't have any pending study requests"
                    : "When people send you study requests, they'll appear here"
                  : filter === 'pending'
                    ? "You don't have any pending sent requests"
                    : "You haven't sent any study requests yet"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const isReceivedTab = tab === 'received';
              const displayUser = isReceivedTab ? request.fromUser : request.toUser;
              const displayUserId = isReceivedTab ? request.fromUserId : request.toUserId;
              const userLabel = isReceivedTab ? 'From' : 'To';

              return (
                <div key={request.id} className={`request-card request-${request.status}`}>
                  {/* Header */}
                  <div className="request-header">
                    <div 
                      className="request-user"
                      onClick={() => router.push(`/user/${displayUserId}`)}
                    >
                      <div className="request-kao">{displayUser?.kao}</div>
                      <div className="request-user-info">
                        <div className="request-username">
                          {userLabel}: @{displayUser?.username}
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

                  {/* Actions - Only show for received requests */}
                  {isReceivedTab && request.status === 'pending' && (
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

                  {/* Status Messages */}
                  {request.status === 'accepted' && (
                    <div className="request-accepted-message">
                      ✓ {isReceivedTab ? 'You accepted this request' : 'Request accepted'}
                    </div>
                  )}

                  {request.status === 'declined' && (
                    <div className="request-declined-message">
                      ✗ {isReceivedTab ? 'You declined this request' : 'Request declined'}
                    </div>
                  )}

                  {request.status === 'pending' && !isReceivedTab && (
                    <div className="request-pending-message">
                      ⏳ Waiting for response...
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}

