'use client';

import { PopulatedCheckIn } from '@/types/study';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import './UserDetailModal.css';

interface UserDetailModalProps {
  checkIn: PopulatedCheckIn;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: () => void;
  isCurrentUser: boolean;
}

export default function UserDetailModal({
  checkIn,
  isOpen,
  onClose,
  onSendRequest,
  isCurrentUser
}: UserDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open to study';
      case 'solo': return 'Solo Mode';
      case 'break': return 'On a Break';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'solo': return 'status-solo';
      case 'break': return 'status-break';
      default: return '';
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  const content = (
    <div className="user-detail-modal-portal">
      <div className="user-detail-modal-backdrop" onClick={onClose} />
      <div className="user-detail-modal">
        <div className="user-detail-header">
          <div 
            className="user-detail-avatar"
            style={{ 
              fontSize: (checkIn.user?.kao?.length || 0) > 5 ? '1.5rem' : '2.5rem'
            }}
          >
            {checkIn.user?.kao || '(^_^)'}
          </div>
          <h3 className="user-detail-name">{checkIn.user?.username || 'Unknown User'}</h3>
          <div className={`user-detail-status ${getStatusClass(checkIn.status)}`}>
            {getStatusLabel(checkIn.status)}
          </div>
        </div>

        <div className="user-detail-body">
          <div className="info-row">
            <span className="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
            <div className="info-content">
              <span className="info-label">Session Schedule</span>
              <div className="info-value">
                Here until {formatTime(checkIn.expiresAt)}
              </div>
            </div>
          </div>

          {checkIn.statusNote && (
            <div className="info-row">
              <span className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </span>
              <div className="info-content">
                <span className="info-label">Note</span>
                <div className="info-value">"{checkIn.statusNote}"</div>
              </div>
            </div>
          )}
        </div>

        <div className="user-detail-actions">
          <button 
            className="btn-cancel" 
            onClick={onClose}
          >
            Close
          </button>
          {!isCurrentUser && (
            <button 
              className="btn-request"
              onClick={onSendRequest}
            >
              Send Request
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

