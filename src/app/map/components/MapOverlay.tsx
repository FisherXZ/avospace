'use client';

import { useRouter } from 'next/navigation';

// Sidebar Icons (matching avo_study page)
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

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  );
}

export default function MapOverlay() {
  const router = useRouter();

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className="map-sidebar d-none d-md-flex">
        <ul className="map-sidebar-items">
          <li
            className="map-sidebar-item"
            onClick={() => router.push('/home')}
            title="Home"
          >
            <span className="map-sidebar-icon">
              <SidebarHomeIcon />
            </span>
            <span className="map-sidebar-label">Home</span>
          </li>
          <li
            className="map-sidebar-item"
            onClick={() => router.push('/avo_study')}
            title="Avo Study"
          >
            <span className="map-sidebar-icon">
              <SidebarStudyIcon />
            </span>
            <span className="map-sidebar-label">Avo Study</span>
          </li>
          <li className="map-sidebar-item map-sidebar-item-active">
            <span className="map-sidebar-icon">
              <MapIcon />
            </span>
            <span className="map-sidebar-label">Map</span>
          </li>
        </ul>
      </aside>
    </>
  );
}

