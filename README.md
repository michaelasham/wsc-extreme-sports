# WSC Extreme Sports Arena

A polished PWA demo for **WSC Extreme Sports** — an AI-powered Rage Meter and Cabin Clash leaderboard system built for camp director approval.

## Demo Purpose

This is a **presentation demo**, not the final production app. It showcases how the Rage Room scoring flow, AI judge results, and cabin leaderboard will look and feel during camp.

- **Current version** uses local mock data only (`src/lib/demo-data.ts`)
- **Future version** will connect to AI photo/video judging, QR/RFID camper scan-in, and Supabase for persistence
- **Staff will always have final override** — scores can be adjusted before confirmation and saving

## Screens

| Route | Description |
|-------|-------------|
| `/` | Demo control panel — launch any demo screen |
| `/rage-room` | Dramatic Rage Meter result reveal with score breakdown |
| `/leaderboard` | Cabin & camper leaderboards with mode toggle |
| `/session-review` | AI judge media review with before/after placeholders and notes |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Install to home screen on mobile for the full PWA experience.

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
│   ├── AnimatedRageMeter.tsx
│   ├── RageResultCard.tsx
│   ├── LeaderboardToggle.tsx
│   ├── CabinLeaderboard.tsx
│   ├── CamperLeaderboard.tsx
│   ├── SessionMediaReview.tsx
│   ├── Badge.tsx
│   └── DemoNavigation.tsx
├── hooks/                # Animation hooks (useCountUp, useInView)
└── lib/
    ├── demo-data.ts      # All mock data — swap for API calls later
    └── types.ts          # Shared TypeScript interfaces
```

Components are designed to accept typed props from `demo-data.ts` today and from API/Supabase responses tomorrow without structural changes.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion (meter fill, leaderboard transitions)
- No backend (mock data only)

## Future Integration Points

- **AI Scoring API** — replace mock scores with before/after photo or video analysis
- **Supabase** — persist sessions, cabins, campers, and confirmed scores
- **QR/RFID scan** — identify camper and cabin at Rage Room entry
- **Staff override panel** — wire "Adjust Score" to an admin form backed by real data
