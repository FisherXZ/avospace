'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData, query, collection, getDocs, where } from "firebase/firestore";
import EditComposer, { EditComposerRef } from '../../../components/EditComposer';
import Post from '../../../components/Post';
import { formatPhoneForDisplay } from '@/lib/validation';
import { Mail, Phone, Pencil, FileText } from 'lucide-react';
import './account.css';

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


function SidebarStudyIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 6.5C4 5.67 4.67 5 5.5 5h8.5a3 3 0 0 1 3 3v10.5l-4.25-2.25L8.5 18.5 4 16.25V6.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 9h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
}

function SidebarMapIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <polygon 
                points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="1.7" />
            <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

function SidebarStatsIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
                        onClick={() => router.push('/avo_study')}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarStudyIcon />
                        </span>
                        <span className="app-sidebar-label">Avo Study</span>
                    </li>
                    <li
                        className="app-sidebar-item"
                        onClick={() => router.push('/map')}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarMapIcon />
                        </span>
                        <span className="app-sidebar-label">Map</span>
                    </li>
                    <li
                        className="app-sidebar-item"
                        onClick={() => router.push('/avo_study/stats')}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarStatsIcon />
                        </span>
                        <span className="app-sidebar-label">Statistics</span>
                    </li>
                </ul>
            </aside>

            {/* Main content */}
            <div className="account-page-container">
                <div className="account-content-wrapper">
                    <section className="account-section">
                        {/* Profile Hero Card */}
                        <div className="profile-hero-card">
                            <div 
                                className="profile-hero-content"
                                style={{ background: bgColor }}
                            >
                                <div className="profile-info">
                                    <div className="profile-avatar">
                                        {kao}
                                    </div>
                                    <h1 className="profile-username">{username}</h1>
                                    <div className="profile-contact">
                                        {email && (
                                            <span className="contact-item">
                                                <Mail size={16} strokeWidth={2} />
                                                {email}
                                            </span>
                                        )}
                                        {phoneNumber && (
                                            <span className="contact-item">
                                                <Phone size={16} strokeWidth={2} />
                                                {formatPhoneForDisplay(phoneNumber)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Edit Button */}
                                <button
                                    className="edit-profile-button"
                                    onClick={() => editComposerRef.current?.open()}
                                >
                                    <Pencil size={18} strokeWidth={2} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        </div>

                        {/* Posts Section */}
                        <div className="posts-section">
                            <h2 className="posts-section-title">Your Posts</h2>
                            {userPosts.length === 0 ? (
                                <div className="empty-posts-state">
                                    <FileText className="empty-icon" size={64} strokeWidth={1.5} />
                                    <h3>No Posts Yet</h3>
                                    <p>Check in at study spots to share your activity</p>
                                </div>
                            ) : (
                                <div className="posts-list">
                                    {userPosts.map((post, idx) => (
                                        <div key={idx} className="post-wrapper">
                                            <Post
                                                clickable={false}
                                                {...post}
                                            />
                                        </div>
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
