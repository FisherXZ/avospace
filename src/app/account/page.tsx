'use client'
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editing = searchParams.get('edit') === 'true';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username);
      setPhoto(data.photo);
      setBgColor(data.bgColor);
    } else if (user) {
      setUsername(user.displayName || user.email);
      setPhoto(user.photoURL);
    }
  }, [user]);

  return (
    <div>
      <h1>Account</h1>
      <p>Account page content goes here.</p>
    </div>
  );
}

