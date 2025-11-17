'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async () => {
    try {
      setError(null);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/account');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser != null) {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            bgColor: "#ffffff",
            kao: "(^ᗜ^)",
            username: email,
            friends: []
          });
        }
        
        router.push('/account');
      }
    } catch (err: any) {
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
