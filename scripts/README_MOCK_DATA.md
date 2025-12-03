# 🎭 Mock Data Scripts

Scripts to seed and cleanup mock study statistics for testing the leaderboard.

---

## 📦 Scripts

### 1. `seedMockStats.ts`
**Purpose:** Creates fake users, stats, and study sessions

**What it creates:**
- ✅ 10 mock users (alice, bob, charlie, diana, ethan, fiona, george, hannah, isaac, julia)
- ✅ User stats with realistic data (sessions, hours, streaks)
- ✅ Study sessions distributed across different spots
- ✅ Varied study patterns per user

### 2. `cleanupMockStats.ts`
**Purpose:** Removes all mock data from Firestore

**What it deletes:**
- ❌ All mock users
- ❌ All mock user stats
- ❌ All mock study sessions

---

## 🚀 How to Use

### Setup

**Install tsx (TypeScript executor):**
```bash
npm install -g tsx
```

*Note: No additional Firebase packages needed - the scripts use your existing Firebase client SDK!*

---

### Seed Mock Data

Run this to populate your database with test data:

```bash
npx tsx scripts/seedMockStats.ts
```

**Expected Output:**
```
🌱 Starting mock data seeding...

📝 Creating mock users...
  ✓ Created user: alice
  ✓ Created user: bob
  ...

📊 Generating user stats...
  ✓ alice: 67 sessions, 89.3h, 15 day streak
  ✓ bob: 45 sessions, 62.1h, 8 day streak
  ...

📚 Generating study sessions...
  ✓ alice: 30 sessions
  ✓ bob: 30 sessions
  ...

✅ Mock data seeding completed!

📈 Summary:
   • 10 mock users created
   • 10 user stats documents created
   • 300 study sessions created

🎉 Your leaderboard should now have data!
   Visit: http://localhost:3000/avo_study/stats
```

---

### Cleanup Mock Data

Run this to remove all mock data:

```bash
npx tsx scripts/cleanupMockStats.ts
```

**Expected Output:**
```
🧹 Starting mock data cleanup...

📝 Deleting mock users...
  ✓ Deleted user: mock_alice
  ✓ Deleted user: mock_bob
  ...

📊 Deleting user stats...
  ✓ Deleted stats: mock_alice
  ...

📚 Deleting study sessions...
  ✓ Deleted 30 sessions for mock_alice
  ...

✅ Mock data cleanup completed!

📈 Summary:
   • 10 mock users deleted
   • 10 user stats documents deleted
   • 300 study sessions deleted
```

---

## 📊 Mock Data Details

### Users Created:
| Username | User ID | Kaomoji |
|----------|---------|---------|
| alice | mock_alice | (^ᗜ^) |
| bob | mock_bob | (◕‿◕) |
| charlie | mock_charlie | (✿◠‿◠) |
| diana | mock_diana | (◠‿◠✿) |
| ethan | mock_ethan | (•‿•) |
| fiona | mock_fiona | (⌐■_■) |
| george | mock_george | (ಠ_ಠ) |
| hannah | mock_hannah | (◕ω◕) |
| isaac | mock_isaac | (｡◕‿◕｡) |
| julia | mock_julia | (≧◡≦) |

### Stats Generated (Realistic Ranges):
- **Sessions:** 15-120 per user
- **Hours:** 20-180h per user
- **Streaks:** 1-45 days current, up to 60 longest
- **Spots visited:** 2-5 different locations per user
- **Session duration:** 30-240 minutes each
- **Time range:** Past 30 days

### Study Spots Distribution:
Each user studies at 2-5 random spots:
- Doe Library
- Moffitt Library
- Main Stacks
- MLK Student Union
- Kresge Engineering

---

## 🔍 Testing the Leaderboard

After seeding, test these features:

### 1. **Global Leaderboard**
```
Visit: /avo_study/stats
Filter: 🌍 All Spots
```
Should show top 10 users ranked by total hours across all spots.

### 2. **Per-Spot Leaderboards**
```
Visit: /avo_study/stats
Filter: 📍 Doe Library (or any other spot)
```
Should show users ranked by hours at that specific spot.

### 3. **Podium Display**
Top 3 users should appear in podium with medals 🥇🥈🥉

### 4. **User Profiles**
Click any user to see their stats on their profile page.

---

## 🎯 Tips

### Want More Data?
Edit `seedMockStats.ts` and modify:
- `mockUsers` array - add more users
- `randomInt(15, 120)` - increase session range
- `sessionCount` in `generateStudySessions` - more sessions per user

### Want Different Data?
Run cleanup then seed again:
```bash
npx tsx scripts/cleanupMockStats.ts
npx tsx scripts/seedMockStats.ts
```

### Keep Mock Users Separate
Mock users have ID prefix `mock_` so they won't conflict with real users.

---

## ⚠️ Important Notes

1. **Development Only:** These scripts are for testing. Don't run in production!

2. **Client SDK:** Uses the same Firebase client SDK as your app (no admin credentials needed).

3. **Firestore Costs:** Mock data counts towards your Firestore read/write limits (minimal impact).

4. **Real Users:** These scripts only touch documents with `mock_` prefix. Your real user data is safe!

5. **Cleanup:** Always run cleanup before re-seeding to avoid duplicates.

6. **Security Rules:** Make sure your Firestore rules allow writes to these collections (they should already if your app works).

---

## 🐛 Troubleshooting

### Error: "tsx not found"
```bash
# Install tsx globally
npm install -g tsx
```

### Error: "Permission denied"
Check your Firestore security rules. The scripts use the client SDK, so they're subject to the same rules as your app. Make sure you can write to `users`, `user_stats`, and `study_sessions` collections.

### No data showing on leaderboard
1. Check Firestore Console to verify data was created
2. Refresh the stats page (Cmd+Shift+R / Ctrl+Shift+R)
3. Check browser console for errors

---

## 📚 Files Structure

```
scripts/
├── seedMockStats.ts           # Creates mock data
├── cleanupMockStats.ts        # Removes mock data
├── seedStudySpots.ts          # Creates study spots (existing)
└── README_MOCK_DATA.md        # This file
```

---

**Happy Testing! 🎉**

