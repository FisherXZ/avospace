'use client';

import './ErrorModal.css';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  actionLabel,
  onAction
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="error-modal-backdrop fade show"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="error-modal-container fade show">
        <div className="error-modal-dialog shake">
          <div className="error-modal-content">
            {/* Icon */}
            <div className="error-modal-icon">
              ⚠️
            </div>

            {/* Title */}
            <h2 className="error-modal-title">
              {title}
            </h2>

            {/* Message */}
            <p className="error-modal-message">
              {message}
            </p>

            {/* Actions */}
            <div className="error-modal-actions">
              {onAction && actionLabel && (
                <button
                  type="button"
                  className="error-modal-btn error-modal-btn-primary"
                  onClick={onAction}
                >
                  {actionLabel}
                </button>
              )}
              <button
                type="button"
                className="error-modal-btn error-modal-btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



