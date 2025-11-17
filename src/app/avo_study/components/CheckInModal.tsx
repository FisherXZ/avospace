'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckInStatus, DURATION_PRESETS, CHAR_LIMITS, STATUS_OPTIONS } from '@/types/study';
import ErrorModal from './ErrorModal';
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

      await addDoc(collection(db, 'check_ins'), {
        userId: auth.currentUser.uid,
        spotId: spot.id,
        status,
        statusNote: statusNote.trim() || null,
        startedAt: now,
        expiresAt,
        isActive: true
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

  return (
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
              <div>
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
                ×
              </button>
            </div>

            {/* Body */}
            <div className="modal-body-custom">
              {/* Duration Picker */}
              <div className="form-section">
                <label className="form-label-custom">
                  <span className="label-icon">⏱️</span>
                  How long will you study?
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
                  <span className="label-icon">
                    <img src="/avocado-icon.png" alt="Status" style={{ width: '20px', height: '20px', objectFit: 'contain', verticalAlign: 'middle' }} />
                  </span>
                  Study status
                </label>
                
                <div className="status-picker">
                  {/* Primary Status Options (Full Height) */}
                  <div className="status-picker-primary">
                    {STATUS_OPTIONS.PRIMARY.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`status-button status-button-primary ${status === option.value ? 'active' : ''}`}
                        onClick={() => setStatus(option.value)}
                        disabled={loading}
                      >
                        <div className="status-button-icon">{option.emoji}</div>
                        <div className="status-button-content">
                          <div className="status-button-title">{option.label}</div>
                          <div className="status-button-desc">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Secondary Status Options (2/3 Height) */}
                  <div className="status-picker-secondary">
                    {STATUS_OPTIONS.SECONDARY.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`status-button status-button-secondary ${status === option.value ? 'active' : ''}`}
                        onClick={() => setStatus(option.value)}
                        disabled={loading}
                      >
                        <div className="status-button-icon-small">{option.emoji}</div>
                        <div className="status-button-content-small">
                          <div className="status-button-title-small">{option.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="form-section">
                <label htmlFor="statusNote" className="form-label-custom">
                  <span className="label-icon">💬</span>
                  Status note (optional)
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
                onClick={handleCheckIn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <span className="button-icon">✓</span>
                    Check In
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
}

