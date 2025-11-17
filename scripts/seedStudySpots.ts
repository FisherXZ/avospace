/**
 * Seed Script for Study Spots Collection
 * 
 * Run this script to populate the study_spots collection with initial data.
 * 
 * Usage:
 *   npx ts-node scripts/seedStudySpots.ts
 * 
 * Or manually copy the studySpots array and add documents via Firebase Console.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Firebase config from your app
const firebaseConfig = {
  apiKey: "AIzaSyBMBoG-NX1lJmf01CAd26SY1Xp6B_PAMzU",
  authDomain: "avospace-6a984.firebaseapp.com",
  projectId: "avospace-6a984",
  storageBucket: "avospace-6a984.firebasestorage.app",
  messagingSenderId: "378745001771",
  appId: "1:378745001771:web:5257c9b6fc40ab98a8d76e",
  measurementId: "G-XNYHDHSFGC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface StudySpot {
  id: string;
  name: string;
  hours: string;
}

/**
 * Study spots data - Simplified for MVP (card-based interface)
 */
export const studySpots: StudySpot[] = [
  {
    id: 'doe-library',
    name: 'Doe Library',
    hours: '8:00 AM - 12:00 AM'
  },
  {
    id: 'moffitt-library',
    name: 'Moffitt Library',
    hours: '24 Hours'
  },
  {
    id: 'main-stacks',
    name: 'Main Stacks',
    hours: '8:00 AM - 10:00 PM'
  },
  {
    id: 'mlk-student-union',
    name: 'MLK Student Union',
    hours: '7:00 AM - 11:00 PM'
  },
  {
    id: 'kresge-engineering',
    name: 'Kresge Engineering Library',
    hours: '8:00 AM - 11:00 PM'
  }
];

/**
 * Seed the study_spots collection
 */
async function seedStudySpots() {
  console.log('🌱 Starting to seed study spots...\n');

  try {
    for (const spot of studySpots) {
      const docRef = doc(db, 'study_spots', spot.id);
      // Don't store 'id' field in the document - it's already the document ID
      const { id, ...spotData } = spot;
      await setDoc(docRef, spotData);
      console.log(`✅ Added: ${spot.name} (${spot.id})`);
    }

    console.log('\n🎉 Successfully seeded all study spots!');
    console.log(`\nTotal spots added: ${studySpots.length}`);
    console.log('\n📋 Each spot has: name, hours (2 fields)');
    console.log('\n💡 Note: Document ID serves as the spot ID');
    
  } catch (error) {
    console.error('❌ Error seeding study spots:', error);
    process.exit(1);
  }
}

// Run the seed function
seedStudySpots()
  .then(() => {
    console.log('\n✨ Seeding complete! You can now use the study spots in your app.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

