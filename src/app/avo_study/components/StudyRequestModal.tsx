'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckInPost, CHAR_LIMITS } from '@/types/study';
import './StudyRequestModal.css';

interface StudyRequestModalProps {
  checkInPost: CheckInPost;
  recipientUsername: string;
  recipientKao: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StudyRequestModal({
  checkInPost,
  recipientUsername,
  recipientKao,
  isOpen,
  onClose,
  onSuccess
}: StudyRequestModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to send requests');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create study request
      await addDoc(collection(db, 'study_requests'), {
        fromUserId: auth.currentUser.uid,
        toUserId: checkInPost.uid,
        checkInId: checkInPost.checkInId,
        spotId: checkInPost.spotId,
        message: message.trim(),
        status: 'pending',
        sentAt: Timestamp.now()
      });

      // Success!
      setMessage('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error sending study request:', err);
      setError(err.message || 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop-custom fade show"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="modal-custom fade show">
        <div className="modal-dialog-custom">
          <div className="modal-content-custom">
            {/* Header */}
            <div className="modal-header-custom">
              <div>
                <h2 className="modal-title-custom">
                  Send Study Request
                </h2>
                <p className="modal-subtitle-custom">
                  to {recipientKao} {recipientUsername}
                </p>
              </div>
              <button
                type="button"
                className="btn-close-custom"
                onClick={handleClose}
                disabled={loading}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="modal-body-custom">
              {/* Context Card */}
              <div className="request-context-card">
                <div className="context-header">
                  <span className="context-icon">📍</span>
                  <span className="context-spot">{checkInPost.spotName}</span>
                </div>
                <div className="context-status">
                  Status: <strong>{checkInPost.status}</strong>
                  {checkInPost.statusNote && (
                    <span className="context-note"> - "{checkInPost.statusNote}"</span>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="form-section">
                <label htmlFor="requestMessage" className="form-label-custom">
                  <span className="label-icon">💬</span>
                  Your message
                </label>
                <textarea
                  id="requestMessage"
                  className="form-textarea-custom"
                  rows={4}
                  maxLength={CHAR_LIMITS.STUDY_REQUEST_MESSAGE}
                  placeholder="Hey! Want to study together? I'm also working on..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
                <div className="char-counter">
                  {message.length}/{CHAR_LIMITS.STUDY_REQUEST_MESSAGE}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert-custom alert-danger">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn-secondary-custom"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-custom"
                onClick={handleSendRequest}
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="button-icon">📨</span>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal if window is defined
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  
  return content;
}

