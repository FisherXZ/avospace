'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
    onAvoMailToggle?: () => void;
}

export default function Navbar({ onAvoMailToggle }: NavbarProps) {
    const [user, setUser] = useState<User | null>(null);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Real-time listener for pending study requests
    useEffect(() => {
        if (!user) {
            setPendingRequestsCount(0);
            return;
        }

        const q = query(
            collection(db, 'study_requests'),
            where('toUserId', '==', user.uid),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                setPendingRequestsCount(snapshot.size);
            },
            (error) => {
                console.error('Error listening to pending requests:', error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (user) {
            router.push('/home');
        }
        // If no user, do nothing (stay on current page)
    };

    const handleLogOut = async () => {
        await signOut(auth);
        router.push('/');
    };

    const isLoginPage = pathname === '/';

    const MailIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
    );

    const TrophyIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
    );

    return(
        <nav className="navbar navbar-expand-lg px-4 fixed-top navbar-shadow">
            <a href="#" className="navbar-brand d-flex align-items-center" onClick={handleLogoClick}>
                <img src="/AvoSpace.png" className="img-fluid" alt="AvoSpace" />
            </a>
            {!isLoginPage && user && (
                <div className="ms-auto d-flex align-items-center gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 position-relative d-flex align-items-center gap-2"
                        onClick={onAvoMailToggle || (() => router.push('/avo_study/inbox'))}
                        title="AvoMail - Study requests"
                    >
                        <MailIcon />
                        <span className="d-none d-md-inline">AvoMail</span>
                        {pendingRequestsCount > 0 && (
                            <span 
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
                            >
                                {pendingRequestsCount}
                            </span>
                        )}
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={() => router.push('/avo_study/leaderboard')}
                        title="Leaderboard"
                    >
                        <TrophyIcon />
                        <span className="d-none d-md-inline">Leaderboard</span>
                    </button>
                    <Link
                        href="/account"
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    >
                        Account
                    </Link>
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        onClick={handleLogOut}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    )
}

