'use client';

import { useState } from 'react';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface SpotUpdate {
  id: string;
  latitude: number;
  longitude: number;
}

const updates: SpotUpdate[] = [
  { id: 'doe-library', latitude: 37.8722, longitude: -122.2591 },
  { id: 'moffitt-library', latitude: 37.8726, longitude: -122.2608 },
  { id: 'main-stacks', latitude: 37.8727, longitude: -122.2601 },
  { id: 'mlk-student-union', latitude: 37.8699, longitude: -122.2585 },
  { id: 'kresge-engineering', latitude: 37.8745, longitude: -122.2570 }
];

export default function MigratePage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<any[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const updateCoordinates = async () => {
    if (!auth.currentUser) {
      setStatus('❌ Please login first!');
      return;
    }

    setLoading(true);
    setStatus('🗺️  Updating study spots with coordinates...');
    setLogs([]);

    try {
      for (const spot of updates) {
        const docRef = doc(db, 'study_spots', spot.id);
        await updateDoc(docRef, {
          latitude: spot.latitude,
          longitude: spot.longitude
        });
        addLog(`✅ Updated: ${spot.id} (${spot.latitude}, ${spot.longitude})`);
      }

      setStatus('🎉 Successfully updated all study spots!');
      addLog(`\n✨ Total spots updated: ${updates.length}`);
      
      // Auto-verify after update
      setTimeout(() => verifyCoordinates(), 1000);
      
    } catch (error: any) {
      setStatus('❌ Error updating study spots');
      addLog(`Error: ${error.message}`);
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCoordinates = async () => {
    setStatus('🔍 Verifying coordinates...');
    setLogs([]);

    try {
      const snapshot = await getDocs(collection(db, 'study_spots'));
      const spots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVerificationData(spots);
      
      const allHaveCoords = spots.every(s => 
        typeof s.latitude === 'number' && typeof s.longitude === 'number'
      );

      if (allHaveCoords) {
        setStatus('✅ All study spots have coordinates!');
        addLog('All study spots verified successfully:');
        spots.forEach(s => {
          addLog(`  ${s.id}: ${s.latitude}, ${s.longitude}`);
        });
      } else {
        setStatus('⚠️ Some spots are missing coordinates');
        spots.forEach(s => {
          if (!s.latitude || !s.longitude) {
            addLog(`  ❌ ${s.id}: Missing coordinates`);
          }
        });
      }
    } catch (error: any) {
      setStatus('❌ Error verifying coordinates');
      addLog(`Error: ${error.message}`);
      console.error('Verification error:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => router.push('/home')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>

      <h1 style={{ marginBottom: '1rem' }}>🗺️ Study Spots Migration</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Add geographic coordinates to study spots for map display
      </p>

      {!auth.currentUser && (
        <div style={{
          padding: '1rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          ⚠️ You must be logged in to run migrations
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={updateCoordinates}
          disabled={loading || !auth.currentUser}
          style={{
            padding: '1rem 2rem',
            background: auth.currentUser ? '#5B9B7E' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: auth.currentUser ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Updating...' : '🚀 Update Coordinates'}
        </button>

        <button
          onClick={verifyCoordinates}
          disabled={loading || !auth.currentUser}
          style={{
            padding: '1rem 2rem',
            background: auth.currentUser ? '#6c757d' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: auth.currentUser ? 'pointer' : 'not-allowed'
          }}
        >
          🔍 Verify Coordinates
        </button>
      </div>

      {status && (
        <div style={{
          padding: '1rem',
          background: status.includes('❌') ? '#f8d7da' : 
                     status.includes('⚠️') ? '#fff3cd' : '#d4edda',
          border: `1px solid ${status.includes('❌') ? '#f5c6cb' : 
                                status.includes('⚠️') ? '#ffc107' : '#c3e6cb'}`,
          borderRadius: '8px',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          {status}
        </div>
      )}

      {logs.length > 0 && (
        <div style={{
          padding: '1rem',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          whiteSpace: 'pre-wrap'
        }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}

      {verificationData.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Study Spots Data:</h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>ID</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>Name</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>Latitude</th>
                <th style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {verificationData.map((spot) => (
                <tr key={spot.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{spot.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>{spot.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {spot.latitude ? spot.latitude.toFixed(4) : '❌ Missing'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                    {spot.longitude ? spot.longitude.toFixed(4) : '❌ Missing'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px'
      }}>
        <h4>ℹ️ What this does:</h4>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li>Adds <code>latitude</code> and <code>longitude</code> fields to each study spot</li>
          <li>Enables map-based visualization of study spots</li>
          <li>Uses accurate UC Berkeley campus coordinates</li>
          <li>Safe to run multiple times (updates existing data)</li>
        </ul>
      </div>
    </div>
  );
}

