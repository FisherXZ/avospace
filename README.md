# 🥑 AvoSpace - Study Coordination App

**Connect with study partners at UC Berkeley campus study spots**

AvoSpace is a social study coordination tool that helps students find study buddies at real campus locations through check-ins, status sharing, and direct study requests.

---

## 🎯 Product Vision

**Primary Function:** Study coordination tool with social features  
**Core Value:** Real-time visibility into who's studying where, with direct partner matching

**Key Features:**
- 📍 Check in at campus study spots
- 👥 See who's studying and their availability status
- 📨 Send/receive study partner requests
- 🔄 Activity feed showing check-ins (no generic posts)
- 👤 Simple friend following model
- 🎨 Customizable kaomoji avatars

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project (Firestore + Auth configured)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/avospace.git
cd avospace

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Firebase Configuration** (already configured in `src/lib/firebase.ts`)
2. **Seed Study Spots:**
   ```bash
   npm run seed-spots
   ```
3. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

---

## 📁 Project Structure

```
avospace/
├── components/              # Shared React components
│   ├── Post.tsx            # Universal post component (check-ins)
│   ├── EditComposer.tsx    # Profile editor
│   └── Navbar.tsx          # Top navigation
│
├── src/
│   ├── app/
│   │   ├── avo_study/      # 🎯 CORE: Study coordination feature
│   │   │   ├── components/ # Study-specific components
│   │   │   ├── inbox/      # Study request inbox
│   │   │   └── utils/      # User cache utilities
│   │   ├── home/           # Activity feed (check-ins only)
│   │   ├── map/            # Map view of study spots
│   │   ├── account/        # User account page
│   │   └── user/[userid]/  # User profiles
│   │
│   ├── lib/
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── validation.ts   # Input validation utilities
│   │
│   └── types/
│       ├── study.ts        # Study feature types
│       └── user.ts         # User types
│
├── docs/                   # Documentation (legacy - being consolidated)
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15.3.4 (App Router)
- React 19
- TypeScript
- Bootstrap 5.3.7
- Custom CSS (Cody Design System)

**Backend:**
- Firebase Authentication
- Firestore Database
- Firebase Hosting

**Deployment:**
- Vercel (development/staging)
- Firebase Hosting (production)

---

## 🎨 Design System

**Cody Design System** - Warm, approachable aesthetic inspired by avocados and study culture

**Key Colors:**
- **Primary Green:** `#5B9B7E` - Actions, buttons
- **Forest Green:** `#4A6B4A` - Headers, emphasis
- **Coral:** `#E89B8E` - "Open to study" status
- **Sky Blue:** `#A8C8E8` - "Solo mode" status

**Typography:**
- Primary: Inter, -apple-system, BlinkMacSystemFont
- Fallback: Segoe UI, Roboto, sans-serif

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data model, component architecture
- **[FEATURES.md](./FEATURES.md)** - Feature specifications and current progress
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions for Vercel and Firebase
- **[TODO.md](./TODO.md)** - Current tasks and roadmap

---

## 🔑 Key Concepts

### Study Spots
Pre-configured campus locations (Doe Library, Moffitt, etc.) where students can check in.

### Check-Ins
Time-limited sessions (30min to 4hrs) where users indicate their presence and availability status at a study spot.

### Status Types
- **Open 🤝** - Available to study together
- **Solo 🎧** - Focused solo work
- **Break ☕** - Taking a break

### Study Requests
Direct messages sent between users to coordinate study sessions. Visible in the Inbox with Received/Sent tabs.

### Activity Feed
Shows only check-in posts (no generic text posts). Friends can see where others are studying in real-time.

---

## 🧪 Development Workflow

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Lint code
npm run lint

# Deploy to Vercel (staging)
vercel

# Deploy to production
vercel --prod
```

---

## 🔐 Environment & Configuration

**Firebase Config** (in `src/lib/firebase.ts`):
- Public configuration (safe to commit)
- No environment variables needed for development

**Firestore Collections:**
- `users` - User profiles and authentication
- `posts` - Activity feed (check-in posts)
- `study_spots` - Campus study locations (seeded)
- `check_ins` - Active study sessions
- `study_requests` - Study partner requests

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes
3. Test locally
4. Submit PR with description
5. Code review
6. Merge to main

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates

---

## 📞 Support

- **Issues:** Use GitHub Issues
- **Questions:** Contact maintainers
- **Documentation:** See `/docs` folder (being consolidated)

---

## 📄 License

See [LICENSE](./LICENSE) file for details.

---

**Built with 🥑 for Berkeley students**
