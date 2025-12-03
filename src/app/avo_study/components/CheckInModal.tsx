'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, Timestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckInStatus, DURATION_PRESETS, CHAR_LIMITS, STATUS_OPTIONS } from '@/types/study';
import ErrorModal from './ErrorModal';
import { X, Clock, MessageSquare, AlertCircle, Check, Loader2, Users, UserX, DoorOpen } from 'lucide-react';
import './CheckInModal.css';

interface CheckInModalProps {
  spot: StudySpot;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ spot, isOpen, onClose }: CheckInModalProps) {
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [status, setStatus] = useState<CheckInStatus>('open');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState<{
    title: string;
    message: string;
    spotName?: string;
  }>({ title: '', message: '' });

  const handleCheckIn = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to check in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user already has an active check-in
      const existingCheckInQuery = query(
        collection(db, 'check_ins'),
        where('userId', '==', auth.currentUser.uid),
        where('isActive', '==', true)
      );

      const existingSnapshot = await getDocs(existingCheckInQuery);
      const activeCheckIns = existingSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.expiresAt?.toMillis() > Date.now();
      });

      if (activeCheckIns.length > 0) {
        // Get details of existing check-in
        const existingCheckIn = activeCheckIns[0].data();
        const existingSpotId = existingCheckIn.spotId;
        
        // Fetch spot name
        let spotName = 'another location';
        try {
          const spotDoc = await getDoc(doc(db, 'study_spots', existingSpotId));
          if (spotDoc.exists()) {
            spotName = spotDoc.data().name;
          }
        } catch (err) {
          console.error('Error fetching spot name:', err);
        }

        // Calculate time remaining
        const timeRemaining = Math.ceil((existingCheckIn.expiresAt.toMillis() - Date.now()) / 60000);
        const hours = Math.floor(timeRemaining / 60);
        const minutes = timeRemaining % 60;
        const timeString = hours > 0 
          ? `${hours}h ${minutes}m` 
          : `${minutes}m`;

        // Close check-in modal and show error modal
        onClose();
        setErrorModalData({
          title: 'Already Checked In',
          message: `You're currently studying at ${spotName}.\n\nTime remaining: ${timeString}`,
          spotName
        });
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // Create new check-in
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        Date.now() + duration * 60 * 1000
      );

      // 1. Create check-in document
      const checkInRef = await addDoc(collection(db, 'check_ins'), {
        userId: auth.currentUser.uid,
        spotId: spot.id,
        status,
        statusNote: statusNote.trim() || null,
        startedAt: now,
        expiresAt,
        isActive: true
      });

      // 2. Create check-in post (appears in social feed)
      const dateNow = new Date();
      await addDoc(collection(db, 'posts'), {
        type: 'checkin',
        text: `Checked in to ${spot.name}`, // Fallback text
        date: `${dateNow.getMonth() + 1}/${dateNow.getDate()}/${dateNow.getFullYear()}`,
        createdAt: now, // Timestamp for proper sorting
        likes: 0,
        uid: auth.currentUser.uid,
        // Check-in specific fields
        checkInId: checkInRef.id,
        spotId: spot.id,
        spotName: spot.name,
        status,
        statusNote: statusNote.trim() || null,
        expiresAt
      });

      // Success - reset and close
      setStatusNote('');
      setDuration(60);
      setStatus('open');
      onClose();
    } catch (err: any) {
      console.error('Error creating check-in:', err);
      setError(err.message || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen && !showErrorModal) return null;

  const content = (
    <>
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorModalData.title}
        message={errorModalData.message}
      />

      {/* Check-in Modal */}
      {isOpen && !showErrorModal && (
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
              <div className="modal-header-content">
                <h2 className="modal-title-custom">
                  Check in to {spot.name}
                </h2>
                <p className="modal-subtitle-custom">
                  Let others know you're studying here
                </p>
              </div>
              <button
                type="button"
                className="btn-close-custom"
                onClick={handleClose}
                disabled={loading}
                aria-label="Close"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body-custom">
              {/* Duration Picker */}
              <div className="form-section">
                <label className="form-label-custom">
                  <Clock size={18} strokeWidth={2} className="label-icon" />
                  <span>How long will you study?</span>
                </label>
                <div className="duration-picker">
                  {DURATION_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`duration-button ${duration === preset.value ? 'active' : ''}`}
                      onClick={() => setDuration(preset.value)}
                      disabled={loading}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Picker */}
              <div className="form-section">
                <label className="form-label-custom">
                  <DoorOpen size={18} strokeWidth={2} className="label-icon" />
                  <span>Study status</span>
                </label>
                
                <div className="status-picker">
                  {STATUS_OPTIONS.map(option => {
                    // Map status to icons
                    const StatusIcon = option.value === 'open' ? Users : 
                                       option.value === 'solo' ? UserX : DoorOpen;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`status-button ${status === option.value ? 'active' : ''}`}
                        onClick={() => setStatus(option.value)}
                        disabled={loading}
                      >
                        <div className="status-button-icon-wrapper">
                          <StatusIcon size={32} strokeWidth={1.5} className="status-icon" />
                        </div>
                        <div className="status-button-content">
                          <div className="status-button-title">{option.label}</div>
                          <div className="status-button-desc">{option.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Note */}
              <div className="form-section">
                <label htmlFor="statusNote" className="form-label-custom">
                  <MessageSquare size={18} strokeWidth={2} className="label-icon" />
                  <span>Status note (optional)</span>
                </label>
                <textarea
                  id="statusNote"
                  className="form-textarea-custom"
                  rows={2}
                  maxLength={CHAR_LIMITS.STATUS_NOTE}
                  placeholder="e.g., Working on CS 61A problem set"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  disabled={loading}
                />
                <div className="char-counter">
                  {statusNote.length}/{CHAR_LIMITS.STATUS_NOTE}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert-custom alert-danger">
                  <AlertCircle size={20} strokeWidth={2} className="alert-icon" />
                  <span>{error}</span>
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
                onClick={handleCheckIn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="button-spinner" />
                    <span>Checking in...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    <span>Check In</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </>
  );

  // Use portal if window is defined
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

