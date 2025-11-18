'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

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

    return(
        <nav className="navbar navbar-expand-lg px-4 fixed-top navbar-shadow">
            <a href="#" className="navbar-brand d-flex align-items-center" onClick={handleLogoClick}>
                <img src="/AvoSpace.png" className="img-fluid" alt="AvoSpace" />
            </a>
            {!isLoginPage && user && (
                <div className="ms-auto d-flex align-items-center gap-2">
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

