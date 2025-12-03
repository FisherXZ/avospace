'use client';

import { useRouter } from 'next/navigation';
import MapView from './components/MapView';
import './map.css';

// Sidebar Icons
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

export default function MapPage() {
  const router = useRouter();

  return (
    <main className="app-shell map-shell">
      {/* Sidebar (desktop) */}
      <aside className="app-sidebar d-none d-md-flex">
        <ul className="app-sidebar-items mt-2">
          <li className="app-sidebar-item" onClick={() => router.push('/home')}>
            <span className="app-sidebar-icon"><SidebarHomeIcon /></span>
            <span className="app-sidebar-label">Home</span>
          </li>
          <li className="app-sidebar-item" onClick={() => router.push('/avo_study')}>
            <span className="app-sidebar-icon"><SidebarStudyIcon /></span>
            <span className="app-sidebar-label">Avo Study</span>
          </li>
          <li className="app-sidebar-item app-sidebar-item-active">
            <span className="app-sidebar-icon"><SidebarMapIcon /></span>
            <span className="app-sidebar-label">Map</span>
          </li>
          <li className="app-sidebar-item" onClick={() => router.push('/avo_study/stats')}>
            <span className="app-sidebar-icon"><SidebarStatsIcon /></span>
            <span className="app-sidebar-label">Statistics</span>
          </li>
        </ul>
      </aside>
      
      {/* Map Content */}
      <div className="map-page">
        <MapView />
      </div>
    </main>
  );
}

