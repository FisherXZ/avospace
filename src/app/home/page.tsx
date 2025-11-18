'use client';
import Post from '../../../components/Post';
import PostComposer, { PostComposerRef } from '../../../components/PostComposer';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<DocumentData[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'friends'>('home');
  const [loading, setLoading] = useState<boolean>(true);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const composerRef = useRef<PostComposerRef | null>(null);
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
      // Get user's friends list
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
      
      // Fetch posts from all friends
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
      
      // Sort by date (newest first) with proper date handling
      friendsPostsData.sort((a, b) => {
        // Handle different date formats
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // If dates are invalid, put them at the end
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
        // Fetch all posts without ordering to avoid index issues
        const q = query(collection(db, 'posts'));
        const snapshot = await getDocs(q);
        let posts = snapshot.docs.map(d => d.data());
        
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
            onClick={() => composerRef.current?.open()}
          >
            <span className="app-sidebar-icon">
              <SidebarPlusIcon />
            </span>
            <span className="app-sidebar-label">Post</span>
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
      <div
        className="page-container-wide"
        style={{ marginLeft: '0', paddingLeft: '16px', paddingRight: '16px' }}
      >
        <div className="d-flex justify-content-center">
          <section style={{ width: '100%', maxWidth: 640 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="section-title mb-0">
                {activeTab === 'home' ? 'Home' : 'Friends'}
              </h1>
            </div>

            {activeTab === 'home' && (
              <>
                {loading && <div className="text-muted-soft mb-2">Loading posts...</div>}
                {error && <div className="text-danger mb-2">{error}</div>}
                {!loading && !error && posts.map((doc, idx) => (
                  <div key={idx} className="mb-3">
                    <Post {...doc} />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'friends' && (
              <>
                {friendsLoading && <div className="text-muted-soft mb-2">Loading friends posts...</div>}
                {!friendsLoading && friendsPosts.length === 0 && (
                  <div className="text-center py-4 text-muted-soft">
                    <p className="mb-1">No posts from friends yet.</p>
                    <p className="mb-0">Add some friends to see their posts here!</p>
                  </div>
                )}
                {!friendsLoading && friendsPosts.length > 0 && friendsPosts.map((doc, idx) => (
                  <div key={idx} className="mb-3">
                    <Post {...doc} />
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      </div>
      <PostComposer
        ref={composerRef}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          // If we're viewing friends tab and this is a friend's post, add it to friends feed too
          if (activeTab === 'friends' && user?.uid && newPost.uid !== user.uid) {
            // Check if this user is a friend
            const checkIfFriend = async () => {
              try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const userData = userDoc.data() as any;
                  const friendsList = userData.friends || [];
                  if (friendsList.includes(newPost.uid)) {
                    setFriendsPosts((prev) => [newPost, ...prev]);
                  }
                }
              } catch (err) {
                console.error('Error checking if user is friend:', err);
              }
            };
            checkIfFriend();
          }
        }}
      />
    </main>
  );
}