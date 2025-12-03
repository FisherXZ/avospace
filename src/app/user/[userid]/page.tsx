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
import { UserStats } from '@/types/study';
// Lucide icons
import { 
  Loader2, 
  AlertTriangle, 
  UserPlus, 
  UserMinus, 
  Pencil, 
  Flame, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  ArrowLeft,
  Info
} from 'lucide-react';
import './user-profile.css';

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
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [userPosts, setUserPosts] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [isLoadingFriend, setIsLoadingFriend] = useState(false);
    const [favoriteSpotName, setFavoriteSpotName] = useState<string>('N/A');
    
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

    // Fetch user stats
    useEffect(() => {
        const fetchUserStats = async () => {
            if (!userId) return;
            
            try {
                const statsRef = doc(db, 'user_stats', userId);
                const statsSnap = await getDoc(statsRef);
                
                if (statsSnap.exists()) {
                    const stats = statsSnap.data() as UserStats;
                    setUserStats(stats);
                    
                    // Fetch favorite spot name
                    if (stats.favoriteSpot) {
                        const spotRef = doc(db, 'study_spots', stats.favoriteSpot);
                        const spotSnap = await getDoc(spotRef);
                        if (spotSnap.exists()) {
                            setFavoriteSpotName(spotSnap.data().name);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching user stats:', err);
            }
        };

        fetchUserStats();
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
            
            if (isFriend) {
                // Remove friend - only update current user's friends list
                await updateDoc(currentUserDocRef, {
                    friends: arrayRemove(userId)
                });
                setIsFriend(false);
            } else {
                // Add friend - only update current user's friends list
                await updateDoc(currentUserDocRef, {
                    friends: arrayUnion(userId)
                });
                setIsFriend(true);
            }
        } catch (err: any) {
            console.error('Error updating friendship:', err);
            // Don't set error state to avoid showing error page
            // Just log the error and reset loading state
            alert('Failed to update friendship. Please try again.');
        } finally {
            setIsLoadingFriend(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="profile-loading-state">
                <Loader2 className="loading-spinner" size={40} />
                <p className="loading-text">Loading profile...</p>
            </div>
        );
    }

    // Error state
    if (error || !userProfile) {
        return (
            <div className="profile-error-state">
                <div className="error-card">
                    <AlertTriangle className="error-icon" size={48} strokeWidth={2} />
                    <h2 className="error-heading">User Not Found</h2>
                    <p className="error-message">{error || 'This profile doesn\'t exist or has been removed.'}</p>
                    <button className="back-button" onClick={() => router.push('/home')}>
                        <ArrowLeft size={18} strokeWidth={2} />
                        <span>Back to Home</span>
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
            <div className="user-profile-container">
                <div className="profile-content-wrapper">
                    <section className="profile-section">
                        {/* Profile Hero Card */}
                        <div className="profile-hero-card">
                            <div 
                                className="profile-hero-content"
                                style={{ background: userProfile.bgColor }}
                            >
                                <div className="profile-info">
                                    <div className="profile-avatar">
                                        {userProfile.kao}
                                    </div>
                                    <h1 className="profile-username">{userProfile.username}</h1>
                                </div>
                                
                                {/* Action Button */}
                                {currentUser && currentUser.uid !== userId && (
                                    <button
                                        className={`friend-action-button ${isFriend ? 'remove' : 'add'}`}
                                        onClick={handleAddFriend}
                                        disabled={isLoadingFriend}
                                    >
                                        {isLoadingFriend ? (
                                            <Loader2 size={18} className="button-spinner" />
                                        ) : isFriend ? (
                                            <UserMinus size={18} strokeWidth={2} />
                                        ) : (
                                            <UserPlus size={18} strokeWidth={2} />
                                        )}
                                        <span>{isLoadingFriend ? 'Loading...' : (isFriend ? 'Remove Friend' : 'Add Friend')}</span>
                                    </button>
                                )}
                                {currentUser && currentUser.uid === userId && (
                                    <button 
                                        className="edit-profile-button"
                                        onClick={() => router.push('/account')}
                                    >
                                        <Pencil size={18} strokeWidth={2} />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Study Stats Section - Matching Stats Page Design */}
                        {userStats && (
                            <div className="stats-card">
                                <h3 className="stats-card-title">Study Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-icon-wrapper">
                                            <Flame className="stat-icon" size={24} strokeWidth={2} />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-value">{userStats.currentStreak}</div>
                                            <div className="stat-label">Day Streak</div>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon-wrapper">
                                            <Calendar className="stat-icon" size={24} strokeWidth={2} />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-value">{userStats.totalSessions}</div>
                                            <div className="stat-label">Sessions</div>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon-wrapper">
                                            <Clock className="stat-icon" size={24} strokeWidth={2} />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-value">{userStats.totalHours.toFixed(1)}h</div>
                                            <div className="stat-label">Total Hours</div>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon-wrapper">
                                            <MapPin className="stat-icon" size={24} strokeWidth={2} />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-value">{favoriteSpotName.split(' ')[0]}</div>
                                            <div className="stat-label">Top Location</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Notices */}
                        {currentUser && currentUser.uid === userId && (
                            <div className="info-notice">
                                <Info size={18} strokeWidth={2} />
                                <span>This is your own profile. <a href="/account">Go to your account page</a> to edit.</span>
                            </div>
                        )}
                        
                        {!currentUser && (
                            <div className="info-notice warning">
                                <Info size={18} strokeWidth={2} />
                                <span><a href="/">Sign in</a> to add this user as a friend.</span>
                            </div>
                        )}

                        {/* Posts Section */}
                        <div className="posts-section">
                            <h2 className="posts-section-title">{userProfile.username}'s Posts</h2>
                            
                            {userPosts.length === 0 ? (
                                <div className="empty-posts-state">
                                    <FileText className="empty-icon" size={64} strokeWidth={1.5} />
                                    <h3>No Posts Yet</h3>
                                    <p>{userProfile.username} hasn't shared any posts</p>
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
        </main>
    );
}
