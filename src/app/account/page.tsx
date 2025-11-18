'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData, query, collection, getDocs, where } from "firebase/firestore";
import PostComposer, { PostComposerRef } from '../../../components/PostComposer';
import EditComposer, { EditComposerRef } from '../../../components/EditComposer';
import FriendsPopup, { FriendsPopupRef } from '../../../components/FriendsPopup';
import UserPost from '../../../components/UserPost';
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

function SidebarPlusIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M12 8v8M8 12h8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
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
    const composerRef = useRef<PostComposerRef | null>(null);
    const editComposerRef = useRef<EditComposerRef | null>(null);
    const friendsPopupRef = useRef<FriendsPopupRef | null>(null);
    
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
                        onClick={() => composerRef.current?.open()}
                    >
                        <span className="app-sidebar-icon">
                            <SidebarPlusIcon />
                        </span>
                        <span className="app-sidebar-label">Post</span>
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
            <div
                className="page-container-wide"
                style={{ marginLeft: '0', paddingLeft: '16px', paddingRight: '16px' }}
            >
                <div className="d-flex justify-content-center">
                    <section style={{ width: '100%', maxWidth: 900 }}>
                        <div
                            className="card-bordered mb-4"
                            style={{ background: bgColor, padding: '32px 24px' }}
                        >
                            <div className="row">
                                {/* Left - avatar & username */}
                                <div className="col-12 col-md-4 px-4 mb-4 mb-md-0">
                                    <div className="d-flex flex-column gap-3">
                                        <div style={{ fontSize: '4rem', whiteSpace: 'nowrap', overflow: 'visible' }}>
                                            {kao}
                                        </div>
                                        <h2 className="mb-2" style={{ wordWrap: 'break-word' }}>
                                            {username}
                                        </h2>
                                        <button
                                            className="btn btn-link p-0 align-self-start"
                                            style={{ textDecoration: 'none', fontSize: '1.5rem' }}
                                            onClick={() => friendsPopupRef.current?.open()}
                                            title="Your Friends"
                                        >
                                            𖠋♡𖠋
                                        </button>
                                    </div>
                                </div>

                                {/* Right - meta / actions */}
                                <div className="col-12 col-md-8 px-4 d-flex flex-column justify-content-between">
                                    <div className="mb-3">
                                        {email && (
                                            <div className="mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                    📧 {email}
                                                </small>
                                            </div>
                                        )}
                                        {phoneNumber && (
                                            <div className="mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                    📱 {formatPhoneForDisplay(phoneNumber)}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="d-flex gap-3 mb-3">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => editComposerRef.current?.open()}
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => composerRef.current?.open()}
                                        >
                                            New Post
                                        </button>
                                    </div>
                                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                        Customize your kaomoji, colors, and share posts with your friends.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-1">
                            <h4 className="mb-3">Your Posts</h4>
                            {userPosts.length === 0 ? (
                                <p className="text-muted">
                                    No posts yet.{' '}
                                    <button
                                        className="btn btn-link p-0"
                                        onClick={() => composerRef.current?.open()}
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        Create your first post!
                                    </button>
                                </p>
                            ) : (
                                <div>
                                    {userPosts.map((post, idx) => (
                                        <UserPost
                                            key={idx}
                                            {...post}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <PostComposer
                ref={composerRef}
                onPostCreated={(doc) => setUserPosts((prev) => [doc, ...prev])}
            />
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
            <FriendsPopup
                ref={friendsPopupRef}
                currentUser={user}
            />
        </main>
    );
}
