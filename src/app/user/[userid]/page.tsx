'use client';
// React hooks and Next.js navigation imports
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// Firebase authentication and Firestore database imports
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, DocumentData, query, collection, getDocs, where } from "firebase/firestore";
// Component imports
import Post from '../../../../components/Post';

// Sidebar Icons (Standardized)
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

function SidebarUsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.5 11a3.5 3.5 0 1 0-2.96-5.33"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 20.25c.8-1.8 2.64-3.25 4.5-3.25s3.7 1.45 4.5 3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 17c2 0 3.8 1.2 4.5 3"
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
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Type definition for user profile data structure
interface UserProfile {
    username: string;
    email?: string;
    phoneNumber?: string;
    phoneCountryCode?: string;
    profileComplete?: boolean;
    bgColor: string;
    kao: string;
    accessory: string;
    leftSide: string;
    leftCheek: string;
    leftEye: string;
    mouth: string;
    rightEye: string;
    rightCheek: string;
    rightSide: string;
}

export default function UserProfile() {
    // State management
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userPosts, setUserPosts] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [isLoadingFriend, setIsLoadingFriend] = useState(false);
    
    const router = useRouter();
    const params = useParams();
    const userId = params.userid as string;

    // Monitor Firebase authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setCurrentUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch the profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const docRef = doc(db, "users", userId);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    setError('User not found');
                    return;
                }
                
                const data = docSnap.data();
                const profile: UserProfile = {
                    username: data.username || 'Unknown User',
                    bgColor: data.bgColor || '#ffffff',
                    kao: data.kao || '(^ᗜ^)',
                    accessory: data.accessory || '',
                    leftSide: data.leftSide || '(',
                    leftCheek: data.leftCheek || '',
                    leftEye: data.leftEye || '^',
                    mouth: data.mouth || 'ᗜ',
                    rightEye: data.rightEye || '^',
                    rightCheek: data.rightCheek || '',
                    rightSide: data.rightSide || ')'
                };
                
                setUserProfile(profile);
            } catch (err: any) {
                console.error('Error fetching user profile:', err);
                setError(err?.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Fetch user posts
    useEffect(() => {
        const fetchPosts = async () => {
            if (!userId) return;
            try {
                const q = query(collection(db, 'posts'), where("uid", "==", userId));
                const snapshot = await getDocs(q);
                let posts = snapshot.docs.map(d => d.data());
                
                // Sort posts by date manually (newest first)
                posts.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    
                    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    
                    return dateB.getTime() - dateA.getTime();
                });
                
                setUserPosts(posts);
            } catch (err: any) {
                setError(err?.message || 'Failed to load user\'s posts');
                console.error('Error fetching user profile:', err);
            }
        };
        fetchPosts();
    }, [userId]);

    // Check friendship status
    useEffect(() => {
        const checkFriendship = async () => {
            if (!currentUser || !userId || currentUser.uid === userId) return;
            
            try {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const friends = userData.friends || [];
                    setIsFriend(friends.includes(userId));
                }
            } catch (err) {
                console.error('Error checking friendship:', err);
            }
        };

        checkFriendship();
    }, [currentUser, userId]);

    // Handle adding or removing friend
    const handleAddFriend = async () => {
        if (!currentUser || !userId || currentUser.uid === userId) return;
        
        setIsLoadingFriend(true);
        
        try {
            const currentUserDocRef = doc(db, "users", currentUser.uid);
            const targetUserDocRef = doc(db, "users", userId);
            
            if (isFriend) {
                // Remove friend
                await updateDoc(currentUserDocRef, {
                    friends: arrayRemove(userId)
                });
                await updateDoc(targetUserDocRef, {
                    friends: arrayRemove(currentUser.uid)
                });
                setIsFriend(false);
            } else {
                // Add friend
                await updateDoc(currentUserDocRef, {
                    friends: arrayUnion(userId)
                });
                await updateDoc(targetUserDocRef, {
                    friends: arrayUnion(currentUser.uid)
                });
                setIsFriend(true);
            }
        } catch (err: any) {
            console.error('Error updating friendship:', err);
            setError(err?.message || 'Failed to update friendship');
        } finally {
            setIsLoadingFriend(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !userProfile) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <h2>Error</h2>
                    <p>{error || 'User not found'}</p>
                    <button className="btn btn-primary" onClick={() => router.push('/home')}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

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
                        onClick={() => router.push('/home')} // Ideally this would go to a "Friends" specific page or tab
                    >
                        <span className="app-sidebar-icon">
                            <SidebarUsersIcon />
                        </span>
                        <span className="app-sidebar-label">Friends</span>
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
                                    background: userProfile.bgColor, 
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
                                        {userProfile.kao}
                                    </div>
                                    <h1 className="display-6 fw-bold mb-2" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>
                                        {userProfile.username}
                                    </h1>
                                </div>
                                
                                {/* Actions */}
                                <div className="position-absolute top-0 end-0 m-4">
                                    {currentUser && currentUser.uid !== userId && (
                                        <button
                                            className={`btn shadow-sm px-4 ${isFriend ? 'btn-light text-danger' : 'btn-light'}`}
                                            onClick={handleAddFriend}
                                            disabled={isLoadingFriend}
                                        >
                                            {isLoadingFriend ? 'Loading...' : (isFriend ? 'Remove Friend' : 'Add Friend')}
                                        </button>
                                    )}
                                    {currentUser && currentUser.uid === userId && (
                                        <button 
                                            className="btn btn-light shadow-sm px-4"
                                            onClick={() => router.push('/account')}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Posts Section */}
                        <div className="px-1">
                            <h4 className="mb-4 fw-bold">
                                {userProfile.username}'s Posts
                            </h4>
                            
                            <div className="mb-4">
                                {currentUser && currentUser.uid === userId && (
                                    <div className="alert alert-info mb-3" style={{ borderRadius: 'var(--radius-md)' }}>
                                        This is your own profile. <a href="/account" className="alert-link">Go to your account page</a> to edit your profile.
                                    </div>
                                )}
                                
                                {!currentUser && (
                                    <div className="alert alert-warning mb-3" style={{ borderRadius: 'var(--radius-md)' }}>
                                        <a href="/login" className="alert-link">Sign in</a> to add this user as a friend.
                                    </div>
                                )}
                            </div>

                            {userPosts.length === 0 ? (
                                <div className="text-center py-5 text-muted-soft bg-light rounded-4">
                                    <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</p>
                                    <p>No posts yet.</p>
                                </div>
                            ) : (
                                <div>
                                    {userPosts.map((post, idx) => (
                                        <div key={idx} className="mb-3">
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
        </main>
    );
}
