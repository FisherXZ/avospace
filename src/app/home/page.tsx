'use client';
import Post from '../../../components/Post';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

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
      
      friendsPostsData.sort((a, b) => {
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
      try {
        const q = query(collection(db, 'posts'));
        const snapshot = await getDocs(q);
        let posts = snapshot.docs.map(d => d.data());
        
        posts.sort((a, b) => {
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
      }
    };
    fetchPosts();
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
    setLoading(false);
  }, []);

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
            className={`app-sidebar-item ${activeTab === 'friends' ? 'app-sidebar-item-active' : ''}`}
            onClick={() => setActiveTab('friends')}
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
          <section style={{ width: '100%', maxWidth: 600 }}>
            {/* Modern Tab Switcher */}
            <div className="d-flex align-items-center justify-content-center mb-5">
              <div 
                className="d-inline-flex p-1 rounded-pill bg-white border shadow-sm"
                style={{ minWidth: '240px' }}
              >
                <button
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${activeTab === 'home' ? 'btn-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('home')}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  For You
                </button>
                <button
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${activeTab === 'friends' ? 'btn-primary' : 'text-muted'}`}
                  onClick={() => setActiveTab('friends')}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  Friends
                </button>
              </div>
            </div>

            {activeTab === 'home' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success mb-3" role="status"></div>
                    <p className="text-muted-soft">Loading your feed...</p>
                  </div>
                )}
                {error && <div className="alert alert-danger rounded-4">{error}</div>}
                
                {!loading && !error && (
                  posts.length > 0 ? (
                    posts.map((doc, idx) => (
                      <div key={idx} className="mb-4">
                        <Post {...doc} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 text-muted-soft">
                      <p className="fs-1 mb-3">🍃</p>
                      <p>It's quiet here.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {friendsLoading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success mb-3" role="status"></div>
                    <p className="text-muted-soft">Loading friends' posts...</p>
                  </div>
                )}
                
                {!friendsLoading && (
                  friendsPosts.length > 0 ? (
                    friendsPosts.map((doc, idx) => (
                      <div key={idx} className="mb-4">
                        <Post {...doc} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 bg-white rounded-4 border border-light shadow-sm">
                      <p className="fs-1 mb-3">🥑</p>
                      <h5 className="fw-bold text-dark mb-2">No friends posts yet</h5>
                      <p className="text-muted mb-0">
                        Add friends to see what they're up to!
                      </p>
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
