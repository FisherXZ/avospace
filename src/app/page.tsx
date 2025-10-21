'use client';
import {useState} from 'react';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '@/lib/firebase';
import {useRouter} from 'next/navigation';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/home');
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('User created successfully');
        }
        } catch (err: unknown){
        alert(err instanceof Error ? err.message : 'An error occurred');
    }
    }

    return (
        <div className="container p-4">
            <h1>{isLogin ? 'Login' : 'Signup'}</h1>
            <input className="form-control my-2"
            placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="form-control my-2"
            placeholder="Password" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} />
            <button className="btn btn-primary" onClick={handleAuth}>{isLogin ? 'Login' : 'Signup'}</button>
            <button className="btn btn-secondary" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Need to create an account?' : 'Already have an account?'}
            </button>
        </div>
    );
}
