# 🥑 AvoSpace

> A social study coordination platform for UC Berkeley students to find study partners at campus locations

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

**AvoSpace** helps students coordinate study sessions through real-time check-ins, location sharing, and direct study partner requests at campus study spots.

---

## ✨ Key Features

- **📍 Study Spot Check-Ins** - Real-time presence at campus locations (Doe Library, Moffitt, etc.)
- **👥 Availability Status** - Show if you're open to study together, solo mode, or on break
- **📨 Study Requests** - Send direct study partner requests to users
- **🗺️ Interactive Map** - Visualize active study sessions across campus
- **🎯 XP & Leaderboards** - Gamified study tracking with tiers and achievements
- **🔄 Activity Feed** - See check-ins and study activity from friends
- **🎨 Kaomoji Avatars** - Customizable text-based avatars

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore & Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/avospace.git
cd avospace

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Initial Setup

1. **Firebase** is already configured in `src/lib/firebase.ts`
2. **Seed study spots:**
   ```bash
   npm run seed-spots
   ```
3. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Bootstrap 5.3, Custom CSS (Cody Design System) |
| **Backend** | Firebase (Auth, Firestore) |
| **Maps** | Leaflet + React Leaflet |
| **Drag & Drop** | dnd-kit |
| **Deployment** | Vercel (staging), Firebase Hosting (production) |

---

## 📁 Project Structure

```
avospace/
├── src/app/
│   ├── avo_study/          # Main study coordination feature
│   │   ├── components/     # Check-ins, modals, leaderboards
│   │   ├── inbox/          # Study request inbox
│   │   ├── stats/          # User statistics & XP
│   │   └── utils/          # XP system, badges, tiers
│   ├── map/                # Interactive campus map
│   ├── home/               # Activity feed
│   └── account/            # User profile management
├── components/             # Shared components
├── src/lib/                # Firebase config & utilities
├── docs/                   # Documentation
└── scripts/                # Database seeding scripts
```

---

## 📚 Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design and data model
- **[Features Overview](./docs/FEATURES.md)** - Feature specifications
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Data Model](./docs/FIRESTORE_DATA_MODEL.md)** - Firestore schema reference
- **[Design System](./docs/cody_design.md)** - Cody Design System guidelines

---

## 🎨 Design Philosophy

**Cody Design System** - A warm, approachable aesthetic inspired by avocados and collaborative study culture.

**Core Colors:**
- `#5B9B7E` Primary Green (actions)
- `#E89B8E` Coral (open to study)
- `#A8C8E8` Sky Blue (solo mode)
- `#4A6B4A` Forest Green (emphasis)

---

## 🧪 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Lint codebase
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

For detailed contribution guidelines, see [docs/TODO.md](./docs/TODO.md).

---

## 📄 License

See [LICENSE](./LICENSE) file for details.

---

**Built with 🥑 for Berkeley students**
