'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySpot } from '@/types/study';
import StudySpotCard from './components/StudySpotCard';
import ActiveCheckInBanner from './components/ActiveCheckInBanner';
import QuestsModal from './components/QuestsModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, AlertTriangle, Library, Target } from 'lucide-react';
import './avo-study.css';

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


function SidebarTiersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M12 2L9 9l-2 13h10l-2-13-3-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sortable wrapper component for study spot cards
interface SortableStudySpotCardProps {
  spot: StudySpot;
}

function SortableStudySpotCard({ spot }: SortableStudySpotCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: spot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`sortable-card-wrapper ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-over' : ''}`}
    >
      <StudySpotCard spot={spot} />
      {!isDragging && (
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="drag-handle"
          title="Drag to reorder"
          aria-label="Drag to reorder study spot"
        >
          ⠿
        </button>
      )}
    </div>
  );
}

export default function AvoStudyPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<StudySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved order from localStorage
  const loadSavedOrder = (fetchedSpots: StudySpot[]): StudySpot[] => {
    try {
      const savedOrder = localStorage.getItem('study-spots-order');
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder) as string[];
        // Create a map for quick lookup
        const spotsMap = new Map(fetchedSpots.map(spot => [spot.id, spot]));
        // Sort based on saved order, putting new spots at the end
        const orderedSpots: StudySpot[] = [];
        orderIds.forEach(id => {
          const spot = spotsMap.get(id);
          if (spot) {
            orderedSpots.push(spot);
            spotsMap.delete(id);
          }
        });
        // Add any new spots that weren't in the saved order
        spotsMap.forEach(spot => orderedSpots.push(spot));
        return orderedSpots;
      }
    } catch (err) {
      console.error('Error loading saved order:', err);
    }
    return fetchedSpots;
  };

  // Save order to localStorage
  const saveOrder = (spots: StudySpot[]) => {
    try {
      const orderIds = spots.map(spot => spot.id);
      localStorage.setItem('study-spots-order', JSON.stringify(orderIds));
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'study_spots'));
        const spotsData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          hours: doc.data().hours
        } as StudySpot));
        
        // Apply saved order
        const orderedSpots = loadSavedOrder(spotsData);
        setSpots(orderedSpots);
      } catch (err: any) {
        console.error('Error fetching study spots:', err);
        setError(err.message || 'Failed to load study spots');
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSpots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveOrder(newOrder);
        return newOrder;
      });
    }
  };

  if (loading) {
    return (
      <div className="avo-study-loading">
        <Loader2 className="loading-spinner" size={40} />
        <p className="loading-text">Loading study spots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle className="error-icon" size={48} strokeWidth={2} />
          <h4 className="error-heading">Connection Error</h4>
          <p className="error-message">{error}</p>
          <p className="error-help">Please check your Firebase connection and try again.</p>
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
          <li className="app-sidebar-item app-sidebar-item-active">
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
          <li
            className="app-sidebar-item"
            onClick={() => router.push('/avo_study/tiers')}
          >
            <span className="app-sidebar-icon">
              <SidebarTiersIcon />
            </span>
            <span className="app-sidebar-label">Tiers</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="avo-study-page">
        <div className="container avo-study-container" style={{ paddingTop: '88px' }}>
          {/* Section Header */}
          <div className="section-header">
            <div>
              <h2 className="section-title">Avo Study Spots</h2>
              <p className="section-subtitle">Check in to let others know you're studying</p>
            </div>
            <button 
              className="quests-btn"
              onClick={() => setIsQuestsModalOpen(true)}
            >
              <Target size={18} />
              <span>Quests</span>
            </button>
          </div>

          {/* Active Check-In Banner */}
          <ActiveCheckInBanner />

          {/* Study Spot Cards Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={spots.map(spot => spot.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="spots-grid">
            {spots.length === 0 ? (
              <div className="empty-state">
                <Library className="empty-icon" size={64} strokeWidth={1.5} />
                <h3>No Study Spots Available</h3>
                <p>Check back soon for available study locations</p>
              </div>
            ) : (
                  spots.map((spot) => (
                    <SortableStudySpotCard key={spot.id} spot={spot} />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

      </div>
      </div>

      {/* Quests Modal */}
      <QuestsModal 
        isOpen={isQuestsModalOpen}
        onClose={() => setIsQuestsModalOpen(false)}
      />
    </main>
  );
}
