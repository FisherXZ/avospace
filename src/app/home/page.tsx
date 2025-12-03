'use client';
import Post from '../../../components/Post';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Leaf, Users } from 'lucide-react';
import './home.css';

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

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'friends'>('home');
  const [loading, setLoading] = useState<boolean>(true);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ user, setUser ] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('this_person');
  const [kao, setKao] = useState<string>('❀༉ʕ˵˃ᗜ˂ ʔ');

  useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

  const fetchFriendsPosts = async () => {
    if (!user?.uid) return;
    
    setFriendsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setFriendsPosts([]);
        return;
      }
      
      const userData = userDoc.data();
      const friendsList = userData.friends || [];
      
      if (friendsList.length === 0) {
        setFriendsPosts([]);
        return;
      }
      
      const friendsPostsData: DocumentData[] = [];
      for (const friendId of friendsList) {
        try {
          const friendPostsQuery = query(collection(db, 'posts'), where("uid", "==", friendId));
          const friendPostsSnapshot = await getDocs(friendPostsQuery);
          const friendPosts = friendPostsSnapshot.docs.map(d => d.data());
          friendsPostsData.push(...friendPosts);
        } catch (err) {
          console.error(`Error fetching posts for friend ${friendId}:`, err);
        }
      }
      
      // Sort by createdAt timestamp (newest first), with fallback to date string
      friendsPostsData.sort((a, b) => {
        // Prioritize createdAt if available
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        
        // Fallback to date string for old posts
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
      setFriendsPosts(friendsPostsData);
    } catch (err: any) {
      console.error('Error fetching friends posts:', err);
      setError(err?.message || 'Failed to load friends posts');
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Query all posts (no orderBy to include posts without createdAt)
        const snapshot = await getDocs(collection(db, 'posts'));
        let posts = snapshot.docs.map(d => d.data());
        
        // Client-side sort - prioritize posts with createdAt, then fall back to date string
        posts.sort((a, b) => {
          // If both have createdAt timestamps
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          
          // If only one has createdAt, prioritize it
          if (a.createdAt && !b.createdAt) return -1;
          if (!a.createdAt && b.createdAt) return 1;
          
          // If neither has createdAt, fall back to date string
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB.getTime() - dateA.getTime();
        });
        
        setPosts(posts);
      } catch (err: any) {
        setError(err?.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        if (user != null) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const data = docSnap.data()
              setProfileName(data.username)
              setKao(data.kao)
          }
        } 
      } catch (err: any) {
        setError(err?.message || 'Failed to load user info');
      }
    }
    getUserInfo();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'friends' && user?.uid) {
      fetchFriendsPosts();
    }
  }, [activeTab, user]);

  return (
    <main className="app-shell">
      {/* Sidebar (desktop) */}
      <aside className="app-sidebar d-none d-md-flex">
        <ul className="app-sidebar-items mt-2">
          <li
            className={`app-sidebar-item ${activeTab === 'home' ? 'app-sidebar-item-active' : ''}`}
            onClick={() => setActiveTab('home')}
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
      <div className="home-page-container">
        <div className="home-content-wrapper">
          <section className="feed-section">
            {/* Tab Switcher */}
            <div className="tab-switcher-wrapper">
              <div className="tab-switcher">
                <button
                  className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                >
                  For You
                </button>
                <button
                  className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  Friends
                </button>
              </div>
            </div>

            {activeTab === 'home' && (
              <div className="tab-content">
                {loading && (
                  <div className="loading-state">
                    <Loader2 className="loading-spinner" size={40} />
                    <p className="loading-text">Loading your feed...</p>
                  </div>
                )}
                {error && (
                  <div className="error-state">
                    <p className="error-message">{error}</p>
                  </div>
                )}
                
                {!loading && !error && (
                  posts.length > 0 ? (
                    <div className="posts-list">
                      {posts.map((doc, idx) => (
                        <div key={idx} className="post-wrapper">
                          <Post {...doc} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Leaf className="empty-icon" size={64} strokeWidth={1.5} />
                      <h3>All Caught Up</h3>
                      <p>No new posts at the moment</p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="tab-content">
                {friendsLoading && (
                  <div className="loading-state">
                    <Loader2 className="loading-spinner" size={40} />
                    <p className="loading-text">Loading friends' posts...</p>
                  </div>
                )}
                
                {!friendsLoading && (
                  friendsPosts.length > 0 ? (
                    <div className="posts-list">
                      {friendsPosts.map((doc, idx) => (
                        <div key={idx} className="post-wrapper">
                          <Post {...doc} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Users className="empty-icon" size={64} strokeWidth={1.5} />
                      <h3>No Friends Posts Yet</h3>
                      <p>Add friends to see what they're up to</p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
