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
        if (!user) {
            e.preventDefault();
        }
    };

    const handleLogOut = async () => {
        await signOut(auth);
        router.push('/');
    };

    const isLoginPage = pathname === '/';

    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-4 fixed-top">
            <Link href="/" className="navbar-brand" onClick={handleLogoClick}>
            <img src = "/assets/images/Avospace.png" className="img-fluid" style={{width: '20vh', height: '6vh'}}/></Link>
            {!isLoginPage && user && (
                <div className="navbar-nav ms-auto">
                    <Link href="/account" className="nav-link">Account</Link>
                    <button className="btn btn-link nav-link" onClick={handleLogOut}>Logout</button>
                </div>
            )}
    
        </nav>
    )
}

