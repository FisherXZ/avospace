'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData, query, collection, getDocs, where } from "firebase/firestore";
import EditComposer, { EditComposerRef } from '../../../components/EditComposer';
import Post from '../../../components/Post';
import { formatPhoneForDisplay } from '@/lib/validation';

function SidebarHomeIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5V14h-5V21H5a1 1 0 0 1-1-1v-9.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SidebarEditIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M16.5 4.5L19.5 7.5L10 17H7V14L16.5 4.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Account() {
    const [ user, setUser ] = useState<User | null>(null);
    const [ username, setUsername ] = useState('this_person');
    const [ email, setEmail ] = useState('');
    const [ phoneNumber, setPhoneNumber ] = useState('');
    const [ phoneCountryCode, setPhoneCountryCode ] = useState('');
    const [ bgColor, setBgColor ] = useState('#ffffff');
    const [ userPosts, setUserPosts ] = useState<DocumentData[]>([]);
    const router = useRouter();
    const editComposerRef = useRef<EditComposerRef | null>(null);
    
    // Kaomoji part states
    const [ accessory, setAccessory ] = useState('');
    const [ leftSide, setLeftSide ] = useState('(');
    const [ leftCheek, setLeftCheek ] = useState('');
    const [ leftEye, setLeftEye ] = useState('^');
    const [ mouth, setMouth ] = useState('ᗜ');
    const [ rightEye, setRightEye ] = useState('^');
    const [ rightCheek, setRightCheek ] = useState('');
    const [ rightSide, setRightSide ] = useState(')');
    const [ kao, setKao ] = useState('(^ᗜ^)');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const getUserInfo = async () => {
            if (user != null) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUsername(data.username || 'this_person');
                    setEmail(data.email || user.email || '');
                    setPhoneNumber(data.phoneNumber || '');
                    setPhoneCountryCode(data.phoneCountryCode || '');
                    setBgColor(data.bgColor || '#ffffff');
                    setKao(data.kao || '(^ᗜ^)');
                    
                    // Set individual kaomoji parts
                    setAccessory(data.accessory || '');
                    setLeftSide(data.leftSide || '(');
                    setLeftCheek(data.leftCheek || '');
                    setLeftEye(data.leftEye || '^');
                    setMouth(data.mouth || 'ᗜ');
                    setRightEye(data.rightEye || '^');
                    setRightCheek(data.rightCheek || '');
                    setRightSide(data.rightSide || ')');
                }
            }
        };
        getUserInfo();
    }, [user]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user?.uid) return;
            try {
                // Fetch posts without orderBy to avoid index requirement
                const q = query(collection(db, 'posts'), where("uid", "==", user.uid));
                const snapshot = await getDocs(q);
                const posts = snapshot.docs.map(d => d.data());
                
                // Sort posts by date manually (newest first)
                posts.sort((a, b) => {
                    // Handle different date formats
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    
                    // If dates are invalid, put them at the end
                    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    
                    return dateB.getTime() - dateA.getTime();
                });
                
                setUserPosts(posts);
            } catch (err: unknown) {
                console.error('Error fetching user posts:', err);
            }
        };
        fetchPosts();
    }, [user]);

    const handleEditCreated = (userData: {
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
    }) => {
        // Update local state with the new data
        setUsername(userData.username);
        setPhoneNumber(userData.phoneNumber || '');
        setPhoneCountryCode(userData.phoneCountryCode || '');
        setBgColor(userData.bgColor);
        // Reconstruct the kaomoji from the individual parts
        const newKao = `${userData.accessory}${userData.leftSide}${userData.leftCheek}${userData.leftEye}${userData.mouth}${userData.rightEye}${userData.rightCheek}${userData.rightSide}`;
        setKao(newKao);
        setAccessory(userData.accessory);
        setLeftSide(userData.leftSide);
        setLeftCheek(userData.leftCheek);
        setLeftEye(userData.leftEye);
        setMouth(userData.mouth);
        setRightEye(userData.rightEye);
        setRightCheek(userData.rightCheek);
        setRightSide(userData.rightSide);
    };

    return (
        <main className="app-shell">
            {/* Sidebar (desktop) */}
            <aside className="app-sidebar d-none d-md-flex">
                <ul className="app-sidebar-items mt-2">
                    <li
                        className="app-sidebar-item"
                        onClick={() => router.push('/home')}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarHomeIcon />
                        </span>
                        <span className="app-sidebar-label">Home</span>
                    </li>
                    <li
                        className="app-sidebar-item"
                        onClick={() => editComposerRef.current?.open()}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarEditIcon />
                        </span>
                        <span className="app-sidebar-label">Edit profile</span>
                    </li>
                </ul>
            </aside>

            {/* Main content */}
            <div className="page-container-wide">
                <div className="d-flex justify-content-center">
                    <section style={{ width: '100%', maxWidth: 900 }}>
                        {/* Hero Card */}
                        <div className="card-elevated mb-5 overflow-hidden">
                            <div 
                                className="p-5 d-flex flex-column align-items-center justify-content-center text-center position-relative"
                                style={{ 
                                    background: bgColor, 
                                    minHeight: '300px',
                                    transition: 'background 0.5s ease'
                                }}
                            >
                                <div className="position-relative z-1">
                                    <div 
                                        className="mb-3"
                                        style={{ 
                                            fontSize: '6rem', 
                                            lineHeight: 1,
                                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                                        }}
                                    >
                                        {kao}
                                    </div>
                                    <h1 className="display-6 fw-bold mb-2" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>
                                        {username}
                                    </h1>
                                    <div className="d-flex justify-content-center gap-3 text-muted-soft" style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                                        {email && <span>📧 {email}</span>}
                                        {phoneNumber && <span>📱 {formatPhoneForDisplay(phoneNumber)}</span>}
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="position-absolute top-0 end-0 m-4">
                                    <button
                                        className="btn btn-light shadow-sm rounded-pill px-4"
                                        onClick={() => editComposerRef.current?.open()}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-1">
                            <h4 className="mb-4 fw-bold">Your Posts</h4>
                            {userPosts.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4">
                                    <p className="fs-1 mb-3">📝</p>
                                    <p className="text-muted mb-0">
                                        No posts yet. Check in at study spots to share your activity!
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {userPosts.map((post, idx) => (
                                        <Post
                                            key={idx}
                                            clickable={false}
                                            {...post}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <EditComposer
                ref={editComposerRef}
                defaultUsername={username}
                defaultPhoneNumber={phoneNumber}
                defaultPhoneCountryCode={phoneCountryCode}
                defaultAccessory={accessory}
                defaultLeftSide={leftSide}
                defaultLeftCheek={leftCheek}
                defaultLeftEye={leftEye}
                defaultMouth={mouth}
                defaultRightEye={rightEye}
                defaultRightCheek={rightCheek}
                defaultRightSide={rightSide}
                defaultBgColor={bgColor}
                onEditCreated={handleEditCreated}
            />
        </main>
    );
}
