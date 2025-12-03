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
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { StudyRequest } from '@/types/study';
import { getUserData } from '../src/app/avo_study/utils/userCache';
import { 
  X, 
  Inbox, 
  Send, 
  Mail, 
  MapPin, 
  Clock, 
  Check, 
  AlertCircle,
  Loader2,
  MessageSquare
} from 'lucide-react';
import './AvoMailPanel.css';

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

interface AvoMailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AvoMailPanel({ isOpen, onClose }: AvoMailPanelProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<PopulatedStudyRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PopulatedStudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // Wait for auth state to be ready
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setLoading(false);
        setRequests([]);
        return;
      }

      // Real-time listener for study requests TO current user
      const q = query(
        collection(db, 'study_requests'),
        where('toUserId', '==', user.uid),
        orderBy('sentAt', 'desc')
      );

      unsubscribeSnapshot = onSnapshot(
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
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Real-time listener for sent requests (FROM current user)
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setSentRequests([]);
        return;
      }

      const q = query(
        collection(db, 'study_requests'),
        where('fromUserId', '==', user.uid),
        orderBy('sentAt', 'desc')
      );

      unsubscribeSnapshot = onSnapshot(
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
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

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
          message: `Accepted! Studying with @${request.fromUser.username}`,
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`avomail-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`avomail-panel ${isOpen ? 'open' : ''}`}>
        <div className="avomail-panel-content">
          {/* Header */}
          <div className="avomail-header">
            <div className="avomail-header-content">
              <Mail size={24} strokeWidth={2} className="header-icon" />
              <h2 className="avomail-title">AvoMail</h2>
            </div>
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="Close AvoMail"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {loading ? (
            <div className="avomail-loading">
              <Loader2 className="loading-spinner" size={40} />
              <p className="loading-text">Loading requests...</p>
            </div>
          ) : (
            <>
              {/* Gmail-style Navigation */}
              <nav className="avomail-nav">
                <button 
                  className={`nav-item ${tab === 'received' ? 'active' : ''}`}
                  onClick={() => setTab('received')}
                >
                  <div className="nav-item-left">
                    <Inbox size={20} strokeWidth={2} className="nav-icon" />
                    <span className="nav-label">Received</span>
                  </div>
                  {pendingCount > 0 && tab === 'received' && (
                    <span className="nav-badge">{pendingCount}</span>
                  )}
                </button>
                <button 
                  className={`nav-item ${tab === 'sent' ? 'active' : ''}`}
                  onClick={() => setTab('sent')}
                >
                  <div className="nav-item-left">
                    <Send size={20} strokeWidth={2} className="nav-icon" />
                    <span className="nav-label">Sent</span>
                  </div>
                </button>
              </nav>

              {/* Requests List */}
              <div className="requests-list">
                {currentRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No requests</h3>
                    <p>
                      {tab === 'received' 
                        ? "When people send you study requests, they'll appear here"
                        : "You haven't sent any study requests yet"}
                    </p>
                  </div>
                ) : (
                  currentRequests.map((request) => {
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
                            onClick={() => {
                              router.push(`/user/${displayUserId}`);
                              onClose();
                            }}
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
            </>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

