'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { validateUsername, validateUsernameFormat, validatePhoneNumber, validateEmail } from '@/lib/validation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const router = useRouter();

  // Real-time username validation (debounced)
  useEffect(() => {
    if (isLogin || !username) {
      setUsernameError(null);
      setUsernameAvailable(false);
      return;
    }

    // Quick format check first
    const formatResult = validateUsernameFormat(username);
    if (!formatResult.valid) {
      setUsernameError(formatResult.error || null);
      setUsernameAvailable(false);
      return;
    }

    // Debounced uniqueness check
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const result = await validateUsername(username);
        setUsernameError(result.error || null);
        setUsernameAvailable(result.valid);
      } catch (error) {
        setUsernameError('Could not verify username');
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, isLogin]);

  // Phone number validation
  useEffect(() => {
    if (isLogin || !phoneNumber) {
      setPhoneError(null);
      return;
    }

    const result = validatePhoneNumber(phoneNumber);
    if (!result.valid) {
      setPhoneError(result.error || null);
    } else {
      setPhoneError(null);
    }
  }, [phoneNumber, isLogin]);

  const handleAuth = async () => {
    try {
      setError(null);
      
      if (isLogin) {
        // Login flow - just email and password
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/account');
      } else {
        // Signup flow - validate all fields
        
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          setError(emailValidation.error || 'Invalid email');
          return;
        }

        // Validate username
        if (!username.trim()) {
          setError('Username is required');
          return;
        }

        const usernameValidation = await validateUsername(username);
        if (!usernameValidation.valid) {
          setError(usernameValidation.error || 'Invalid username');
          return;
        }

        // Validate phone (if provided)
        let formattedPhone = '';
        let countryCode = '';
        if (phoneNumber.trim()) {
          const phoneValidation = validatePhoneNumber(phoneNumber);
          if (!phoneValidation.valid) {
            setError(phoneValidation.error || 'Invalid phone number');
            return;
          }
          formattedPhone = phoneValidation.formatted || '';
          countryCode = phoneValidation.countryCode || '';
        }

        // Create auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (userCredential.user) {
          // Create user profile document
          await setDoc(doc(db, "users", userCredential.user.uid), {
            // Identity
            email: email.toLowerCase().trim(),
            username: username.toLowerCase().trim(),
            
            // Contact
            phoneNumber: formattedPhone || null,
            phoneCountryCode: countryCode || null,
            phoneVerified: false,
            
            // Profile Status
            profileComplete: true,
            createdAt: Timestamp.now(),
            
            // Appearance (defaults)
            bgColor: "#ffffff",
            kao: "(^ᗜ^)",
            accessory: '',
            leftSide: '(',
            leftCheek: '',
            leftEye: '^',
            mouth: 'ᗜ',
            rightEye: '^',
            rightCheek: '',
            rightSide: ')',
            
            // Social
            friends: []
          });
        }
        
        router.push('/account');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="app-shell">
      <div className="page-container-wide d-flex flex-column flex-lg-row align-items-center justify-content-center gap-5">
        {/* Branding / Hero column */}
        <section className="text-center text-lg-start mb-4 mb-lg-0" style={{ maxWidth: 420 }}>
          <div className="mb-3">
            <img
              src="/AvoSpace.png"
              alt="AvoSpace"
              style={{ height: '56px', width: 'auto' }}
            />
          </div>
          <h1 className="mb-3" style={{ fontSize: '28px', fontWeight: 600 }}>
            Share your mood in kaomoji.
          </h1>
          <p className="text-muted-soft mb-0">
            Log in to see posts from your friends, or sign up to create your own AvoSpace profile.
          </p>
        </section>

        {/* Auth card */}
        <section className="card-elevated w-100" style={{ maxWidth: 400 }}>
          <div className="p-4 p-md-5">
            {/* Toggle */}
            <div className="d-flex mb-4 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                type="button"
                className="btn flex-fill"
                style={{
                  boxShadow: 'none',
                  borderRadius: 0,
                  borderBottom: isLogin ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontWeight: isLogin ? 600 : 500
                }}
                onClick={() => setIsLogin(true)}
              >
                Log in
              </button>
              <button
                type="button"
                className="btn flex-fill"
                style={{
                  boxShadow: 'none',
                  borderRadius: 0,
                  borderBottom: !isLogin ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontWeight: !isLogin ? 600 : 500
                }}
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </button>
            </div>

            {/* Form */}
            <h2 className="mb-3" style={{ fontSize: '20px', fontWeight: 600 }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>

            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: '13px' }}>
                Email
              </label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '13px' }}>
                    Username <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      className={`form-control ${usernameError ? 'is-invalid' : usernameAvailable ? 'is-valid' : ''}`}
                      type="text"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {checkingUsername && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status">
                          <span className="visually-hidden">Checking...</span>
                        </div>
                      </div>
                    )}
                    {usernameAvailable && !checkingUsername && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                        <span className="text-success">✓</span>
                      </div>
                    )}
                  </div>
                  {usernameError && (
                    <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>
                      {usernameError}
                    </div>
                  )}
                  {!usernameError && !checkingUsername && (
                    <div className="form-text" style={{ fontSize: '11px' }}>
                      💡 3-20 characters, letters, numbers and underscores only
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label mb-1" style={{ fontSize: '13px' }}>
                    Phone Number <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                    type="tel"
                    placeholder="+1 (415) 555-1234"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {phoneError && (
                    <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>
                      {phoneError}
                    </div>
                  )}
                  {!phoneError && (
                    <div className="form-text" style={{ fontSize: '11px' }}>
                      📱 For study buddy notifications (kept private)
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontSize: '13px' }}>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-100 mb-2"
              onClick={handleAuth}
            >
              {isLogin ? 'Log in' : 'Sign up'}
            </button>

            <div className="text-center mt-2" style={{ fontSize: '13px' }}>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Need to create an account?' : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
