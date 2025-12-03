# Hours & XP System Analysis

## Executive Summary

Your AvoSpace app operates with a **dual progression system**:
1. **Hours-based system** - Legacy system used primarily for leaderboard rankings
2. **XP-based system** - Modern gamified system for tier progression and rewards

Both systems coexist and track different aspects of user engagement.

---

## System Architecture

### 1. User Statistics (`UserStats` type)

Every user has a stats document that tracks **both systems simultaneously**:

```typescript
interface UserStats {
  // HOURS SYSTEM
  totalMinutes: number;      // Raw time tracked
  totalHours: number;        // totalMinutes / 60
  
  // XP SYSTEM
  totalXP: number;           // Gamified progression points
  coins: number;             // AvoCoins (totalXP / 5)
  
  // Shared metrics
  totalSessions: number;
  currentStreak: number;
  spotStats: {...};
}
```

---

## How Each System Works

### Hours System (Simple Time Tracking)

**Purpose:** Objective measurement for leaderboard competition

**Calculation:**
- Direct time conversion: `1 hour = 1 point`
- Tracked in `totalMinutes` → converted to `totalHours`
- No bonuses, no caps - pure time measurement

**Where it's used:**
- **Leaderboard Rankings** (`/avo_study/leaderboard`)
  - Default "Hours" tab ranks users by `totalHours`
  - Per-location leaderboards filter by spot-specific hours
  - Used for tier display badges (Seedling → Legend)

**Tier Thresholds (Hours-based):**
- Seedling: 0-10 hours
- Studier: 10-25 hours
- Scholar: 25-50 hours
- Grinder: 50-100 hours
- Master: 100-200 hours
- Legend: 200+ hours

**Implementation:** `src/app/avo_study/utils/tiers.ts`

---

### XP System (Gamified Progression)

**Purpose:** Engagement through gamification with bonuses and progression

**Calculation Formula:**

```
Base XP = (duration / 25 minutes) × 10 XP
+ Status Note Bonus: +5 XP
+ Co-Study Bonus: +5 XP
+ First Session of Day: +10 XP
- Soft Cap: After 300 XP/day, earn at 50% rate
```

**Example:**
- 60-minute session = 2.4 blocks × 10 = **24 XP**
- With status note + first session = 24 + 5 + 10 = **39 XP**
- After 300 XP in a day, gains are halved to prevent grinding

**Where it's used:**
- **Tier Progression Page** (`/avo_study/tiers`)
  - Visual showcase of all 6 tiers
  - Progress bar to next tier
  - XP requirements displayed
  - Current user tier highlighted
- **Coins Economy**
  - Conversion: `5 XP = 1 AvoCoin`
  - Displayed alongside XP on tier page

**Tier Thresholds (XP-based):**
- Seedling: 0-600 XP (0-10 hours equivalent)
- Studier: 600-1,500 XP (10-25 hours)
- Scholar: 1,500-3,000 XP (25-50 hours)
- Grinder: 3,000-6,000 XP (50-100 hours)
- Master: 6,000-12,000 XP (100-200 hours)
- Legend: 12,000+ XP (200+ hours)

**Migration Formula:** `1 hour = 60 XP` (for existing users)

**Implementation:** `src/app/avo_study/utils/xp.ts`

---

## How They Interact

### Session Recording Flow

When a user checks out (manually or auto-expires):

```
1. Record study session → Firestore `study_sessions` collection
   ↓
2. Update UserStats (statsManager.ts)
   ↓
   ├─→ Hours System: totalMinutes += duration
   │                 totalHours = totalMinutes / 60
   │
   └─→ XP System:    sessionXP = (duration / 60) * 60
                     totalXP += sessionXP
                     coins = totalXP / 5
```

**Current Implementation Note:** 
The `statsManager.ts` uses a **simplified XP calculation** for automatic stats updates:
- `60 XP per hour` (no bonuses)
- This differs from the full `calculateSessionXP()` function which includes bonuses
- This may be intentional for automatic updates vs. manual calculations

---

## Leaderboard Integration

The leaderboard (`/avo_study/leaderboard`) has **3 tabs**, all using the **hours system**:

### 1. Hours Tab (Default)
- Ranks by `totalHours`
- Shows hours-based tier badge
- Uses `getTier(hours)` from `tiers.ts`

### 2. Streak Tab
- Ranks by `currentStreak` (days)
- Still displays total hours as secondary metric
- Shows tier based on hours

### 3. Location Tab
- Filters by specific study spot
- Ranks by hours at that location (`spotStats[spotId].totalMinutes / 60`)
- Dynamic filtering + per-spot leaderboards

**Key Insight:** Leaderboard never directly uses XP - it's purely hours-based for fair competition

---

## Tier Display Logic

### Leaderboard Shows Hours-Based Tiers
```typescript
// In leaderboard/page.tsx
import { getTier } from '../utils/tiers';

const tierDisplay = myStats ? getTierDisplay(myStats.totalHours) : null;
// Uses hours-based TIERS array
```

### Tiers Page Shows XP-Based Progression
```typescript
// In tiers/page.tsx
import { XP_TIERS, getTierByXP } from '../utils/xp';

const currentTier = getTierByXP(myStats.totalXP);
const isUnlocked = myStats.totalXP >= tier.minXP;
// Uses XP-based XP_TIERS array
```

---

## Type System Design

### Flexible `Tier` Interface

To support both systems, the `Tier` type uses **optional properties**:

```typescript
interface Tier {
  level: TierLevel;          // 'seedling' | 'studier' | ...
  name: string;
  
  // Hours system (optional)
  minHours?: number;
  maxHours?: number;
  
  // XP system (optional)
  minXP?: number;
  maxXP?: number;
  podiumHeight?: number;     // Visual height for tier showcase
  
  // Shared
  icon: string;
  color: string;
  bgColor: string;
}
```

This allows:
- `TIERS` in `tiers.ts` to define `minHours/maxHours`
- `XP_TIERS` in `xp.ts` to define `minXP/maxXP/podiumHeight`
- Both use the same tier levels/names/colors

---

## Advantages of Dual System

### Hours System Benefits
✅ **Objective** - Can't be gamed, pure time investment
✅ **Competitive** - Fair basis for leaderboard rankings
✅ **Simple** - Easy to understand (1 hour = 1 point)
✅ **Cross-comparable** - Users can compare across spots/timeframes

### XP System Benefits
✅ **Engaging** - Bonuses for good behaviors (notes, co-study)
✅ **Balanced** - Soft cap prevents unhealthy grinding
✅ **Gamified** - More exciting progression with coins
✅ **Flexible** - Can adjust XP rates without affecting historical data

---

## Potential Issues & Considerations

### 1. **Diverging Progression**
- Users could have different tier levels in hours vs XP
- Example: 150 hours (Master tier) but only 8,000 XP (still Master, but different thresholds)
- **Mitigation:** Thresholds are proportionally aligned (1 hour ≈ 60 XP)

### 2. **Simplified Stats Calculation**
- `statsManager.ts` uses basic "60 XP/hour" formula
- Doesn't account for bonuses from status notes, co-study, etc.
- **Impact:** Users earn less XP than expected if they use bonus features
- **Recommendation:** Consider using full `calculateSessionXP()` in stats updates

### 3. **Display Confusion**
- Leaderboard shows hours-based tiers
- Tier page shows XP-based progression
- **Mitigation:** Clear UI separation - users understand leaderboard = competition, tiers page = personal progression

### 4. **Migration Complexity**
- Users who joined before XP system have hours but no XP
- Migration formula exists: `hoursToXP(hours) = hours * 60`
- **Status:** Need to verify if migration has been applied to all users

---

## Recommendations

### Short Term
1. ✅ **Already Fixed:** Type system supports both (optional properties)
2. 📝 **Document:** Add inline comments explaining dual system in key files
3. 🔍 **Verify:** Check if all existing users have XP migrated from hours

### Long Term
1. **Unify Calculation:** Use full `calculateSessionXP()` in `statsManager.ts` instead of simplified formula
2. **Consistent Tiers:** Consider using XP as primary, derive hours-based rankings from XP
3. **Feature Flag:** Add toggle to switch between hours/XP display on leaderboard
4. **Analytics:** Track which system users engage with more

---

## Files Reference

| File | Purpose | System |
|------|---------|--------|
| `src/types/study.ts` | Unified `Tier` and `UserStats` types | Both |
| `src/app/avo_study/utils/tiers.ts` | Hours-based tier logic | Hours |
| `src/app/avo_study/utils/xp.ts` | XP calculation & XP-based tiers | XP |
| `src/app/avo_study/utils/statsManager.ts` | Session recording & stats updates | Both |
| `src/app/avo_study/leaderboard/page.tsx` | Competition rankings | Hours |
| `src/app/avo_study/tiers/page.tsx` | Personal progression showcase | XP |

---

## Conclusion

Your dual system is actually a **clever design** that balances:
- **Fair competition** (hours-based leaderboard)
- **Engaging progression** (XP-based tiers with gamification)

The systems complement each other rather than compete, serving different user needs. The main area for improvement is ensuring the XP calculation in automated stats updates matches the full bonus system to maintain user expectations.

