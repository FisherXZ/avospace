'use client';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { validatePhoneNumber, formatPhoneForDisplay, maskPhoneNumber } from '@/lib/validation';

export type EditComposerRef = {
  open: () => void;
  close: () => void;
};

type EditComposerProps = {
  onEditCreated?: (doc: {
    username: string;
    phoneNumber?: string;
    phoneCountryCode?: string;
    accessory: string;
    leftSide: string;
    leftCheek: string;
    leftEye: string;
    mouth: string;
    rightEye: string;
    rightCheek: string;
    rightSide: string;
    bgColor: string;
  }) => void;
  defaultUsername?: string;
  defaultPhoneNumber?: string;
  defaultPhoneCountryCode?: string;
  defaultAccessory?: string;
  defaultLeftSide?: string;
  defaultLeftCheek?: string;
  defaultLeftEye?: string;
  defaultMouth?: string;
  defaultRightEye?: string;
  defaultRightCheek?: string;
  defaultRightSide?: string;
  defaultBgColor?: string;
};

const EditComposer = forwardRef<EditComposerRef, EditComposerProps>(function EditComposer(
  { onEditCreated, defaultUsername = 'this_person', defaultPhoneNumber = '', defaultPhoneCountryCode = '', 
    defaultAccessory = '', defaultLeftSide = '(', defaultLeftCheek = '', 
    defaultLeftEye = '^', defaultMouth = 'ᗜ', defaultRightEye = '^', defaultRightCheek = '', defaultRightSide = ')', defaultBgColor = '#ffffff'},
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // State variables
  const [username, setUsername] = useState(defaultUsername);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [bgColor, setBgColor] = useState(defaultBgColor);
  const [accessory, setAccessory] = useState(defaultAccessory);
  const [leftSide, setLeftSide] = useState(defaultLeftSide);
  const [leftCheek, setLeftCheek] = useState(defaultLeftCheek);
  const [leftEye, setLeftEye] = useState(defaultLeftEye);
  const [mouth, setMouth] = useState(defaultMouth);
  const [rightEye, setRightEye] = useState(defaultRightEye);
  const [rightCheek, setRightCheek] = useState(defaultRightCheek);
  const [rightSide, setRightSide] = useState(defaultRightSide);

  // Update state when props change
  useEffect(() => {
    setUsername(defaultUsername);
    setPhoneNumber(defaultPhoneNumber);
    setBgColor(defaultBgColor);
    setAccessory(defaultAccessory);
    setLeftSide(defaultLeftSide);
    setLeftCheek(defaultLeftCheek);
    setLeftEye(defaultLeftEye);
    setMouth(defaultMouth);
    setRightEye(defaultRightEye);
    setRightCheek(defaultRightCheek);
    setRightSide(defaultRightSide);
  }, [defaultUsername, defaultPhoneNumber, defaultBgColor, defaultAccessory, defaultLeftSide, defaultLeftCheek, defaultLeftEye, defaultMouth, defaultRightEye, defaultRightCheek, defaultRightSide]);

  // Validate phone number on change
  useEffect(() => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneError(null);
      return;
    }
    
    const result = validatePhoneNumber(phoneNumber);
    setPhoneError(result.error || null);
  }, [phoneNumber]);

  const accessories = ['', '✧', '𝜗ৎ','⋆˚꩜｡','⋆˚࿔', 'ꉂ', 'ദി', '✧ദ്ദി', '❀༉', '♡', '⸜', '٩', 'و', '⸝', 'ᕙ','ᕗ'];
  const leftSides = ['(', '[', '𐔌', 'ʕ', '|', '૮'];
  const rightSides = [')', ']', '𐦯', 'ʔ', '|', 'ა'];
  const cheeks = [' ', '^','˵','՞', '｡', '*', '๑', '..','ᐢ', '⸝⸝'];
  const leftEyes = ['˃', '╥', 'ᵔ','•', '•̀', '-','◞', '꩜⁭', '°', '.', '≧', '◜','¬', 'ᴗ͈', 'ˆ'];
  const rightEyes = ['˂', '╥', 'ᵔ','•', '•́','-', '◟', '꩜⁭', '°','.', '≦', '◝', '¬', 'ᴗ͈', 'ˆ'];
  const mouths = ['', 'ᗜ', '▽', '﹏', 'ヮ', '‿', '⤙', '꒳', '˕', '˘', '𐃷',' ̫','⌓','‸', 'ᴗ'];

  function Dropdown({ label, options, value, onChange }: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
  }) {
    return (
      <div className="mb-3">
        <label className="form-label small text-muted fw-bold text-uppercase">{label}</label>
        <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt || '(none)'}</option>
          ))}
        </select>
      </div>
    );
  }

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate phone if provided
      let formattedPhone = '';
      let countryCode = '';
      if (phoneNumber && phoneNumber.trim()) {
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
          setError(phoneValidation.error || 'Invalid phone number');
          setIsSubmitting(false);
          return;
        }
        formattedPhone = phoneValidation.formatted || '';
        countryCode = phoneValidation.countryCode || '';
      }
      
      const newKao = `${accessory}${leftSide}${leftCheek}${leftEye}${mouth}${rightEye}${rightCheek}${rightSide}`;
      const userData = {
        username: username.trim(),
        phoneNumber: formattedPhone || null,
        phoneCountryCode: countryCode || null,
        accessory,
        leftSide,
        leftCheek,
        leftEye,
        mouth,
        rightEye,
        rightCheek,
        rightSide,
        bgColor,
        kao: newKao,
      };
      
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, userData);
      
      // Pass to callback with undefined instead of null for optional fields
      onEditCreated?.({
        ...userData,
        phoneNumber: formattedPhone || undefined,
        phoneCountryCode: countryCode || undefined,
      });
      setIsOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live preview of the kaomoji
  const liveKaomoji = `${accessory}${leftSide}${leftCheek}${leftEye}${mouth}${rightEye}${rightCheek}${rightSide}`;

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ 
        background: 'rgba(0,0,0,0.4)', 
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="card-elevated p-0 d-flex flex-column"
        style={{
          width: 'min(90vw, 600px)',
          maxHeight: '90vh',
          animation: 'fadeInUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-bottom">
          <h5 className="mb-0 fw-bold">Edit Profile</h5>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto">
          {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}
          
          <div className="mb-4">
            <label className="form-label fw-bold">Username</label>
            <input 
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <small className="form-text text-muted">This cannot be changed later</small>
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold">Phone Number <span className="text-muted fw-normal">(optional)</span></label>
            <input 
              className={`form-control ${phoneError ? 'is-invalid' : ''}`}
              type="tel"
              placeholder="+1 (415) 555-1234"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {phoneError && (
              <div className="invalid-feedback">{phoneError}</div>
            )}
            {!phoneError && (
              <small className="form-text text-muted">
                📱 For study buddy notifications (kept private)
              </small>
            )}
          </div>
          
          {/* Live Kaomoji Preview */}
          <div className="mb-4 p-4 border rounded-3 text-center" style={{ background: bgColor, transition: 'background 0.3s ease' }}>
            <label className="form-label fw-bold mb-3 d-block text-start">Live Preview</label>
            <div style={{ fontSize: '3rem', minHeight: '4rem', lineHeight: 1 }}>
              {liveKaomoji}
            </div>
          </div>
          
          <h6 className="fw-bold mb-3">Customize Kaomoji</h6>
          <div className="row g-3">
            <div className="col-6 col-md-4"><Dropdown label="Accessory" options={accessories} value={accessory} onChange={setAccessory} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Left Side" options={leftSides} value={leftSide} onChange={setLeftSide} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Left Cheek" options={cheeks} value={leftCheek} onChange={setLeftCheek} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Left Eye" options={leftEyes} value={leftEye} onChange={setLeftEye} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Mouth" options={mouths} value={mouth} onChange={setMouth} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Right Eye" options={rightEyes} value={rightEye} onChange={setRightEye} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Right Cheek" options={cheeks} value={rightCheek} onChange={setRightCheek} /></div>
            <div className="col-6 col-md-4"><Dropdown label="Right Side" options={rightSides} value={rightSide} onChange={setRightSide} /></div>
          </div>
          
          <div className="mt-3">
            <label className="form-label fw-bold">Background Color</label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="form-control form-control-color"
                style={{ width: '60px' }}
              />
              <span className="text-muted small">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-top bg-light d-flex justify-content-end gap-2 rounded-bottom">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default EditComposer;
