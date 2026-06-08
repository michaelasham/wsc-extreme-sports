import type { Cabin, Camper, DemoNavItem, SessionResult } from "./types";

export const APP_TITLE = "WSC Extreme Sports Arena";
export const APP_SUBTITLE = "AI-powered cabin scoring demo";

const cabinData = [
  {
    id: "cabin-3",
    number: 3,
    name: "Eagles",
    mascot: "🦅",
    points: 1240,
    rank: 1,
    badges: [{ id: "top", label: "Top Climber", variant: "gold" as const }],
  },
  {
    id: "cabin-7",
    number: 7,
    name: "Lions",
    mascot: "🦁",
    points: 920,
    rank: 2,
    isHighlighted: true,
    badges: [
      { id: "energy", label: "Best Team Energy", variant: "orange" as const },
      { id: "climber", label: "Top Climber", variant: "gold" as const },
    ],
  },
  {
    id: "cabin-12",
    number: 12,
    name: "Wolves",
    mascot: "🐺",
    points: 890,
    rank: 3,
    badges: [
      { id: "safety", label: "Cleanest Safety Record", variant: "green" as const },
    ],
  },
  {
    id: "cabin-5",
    number: 5,
    name: "Falcons",
    mascot: "🦅",
    points: 810,
    rank: 4,
  },
  {
    id: "cabin-9",
    number: 9,
    name: "Bears",
    mascot: "🐻",
    points: 760,
    rank: 5,
  },
] as const satisfies readonly Cabin[];

export const cabins: Cabin[] = [...cabinData].sort((a, b) => a.rank - b.rank);

const camperData = [
  {
    id: "camper-daniel",
    name: "Daniel N.",
    cabinNumber: 7,
    cabinName: "Lions",
    points: 920,
    rank: 1,
    isHighlighted: true,
  },
  {
    id: "camper-mark",
    name: "Mark R.",
    cabinNumber: 3,
    cabinName: "Eagles",
    points: 870,
    rank: 2,
  },
  {
    id: "camper-peter",
    name: "Peter S.",
    cabinNumber: 12,
    cabinName: "Wolves",
    points: 845,
    rank: 3,
  },
  {
    id: "camper-john",
    name: "John M.",
    cabinNumber: 5,
    cabinName: "Falcons",
    points: 810,
    rank: 4,
  },
  {
    id: "camper-fady",
    name: "Fady K.",
    cabinNumber: 9,
    cabinName: "Bears",
    points: 760,
    rank: 5,
  },
] as const satisfies readonly Camper[];

export const campers: Camper[] = [...camperData].sort((a, b) => a.rank - b.rank);

export const latestSessionResult: SessionResult = {
  id: "session-demo-001",
  cabin: cabins.find((c) => c.number === 7)!,
  camper: "Daniel N.",
  scores: {
    rageScore: 8.7,
    rageScoreMax: 10,
    destructionLevel: 92,
    teamEnergy: 9.1,
    teamEnergyMax: 10,
    safetyDiscipline: 8.4,
    safetyDisciplineMax: 10,
    creativityBonus: 50,
    totalScore: 920,
  },
  rankMovement: {
    previousRank: 8,
    currentRank: 4,
  },
  aiNotes: [
    "High destruction completion",
    "Strong team energy",
    "No unsafe behavior detected",
    "Creativity bonus awarded for coordinated team challenge",
  ],
  sessionComplete: true,
};

export const aiJudgeNotes = latestSessionResult.aiNotes;

export const demoNavItems: DemoNavItem[] = [
  {
    href: "/rage-room",
    label: "Start Rage Room Demo",
    description: "Launch the dramatic Rage Meter result reveal",
    icon: "rage",
  },
  {
    href: "/leaderboard",
    label: "View Cabin Leaderboard",
    description: "See live Cabin Clash standings",
    icon: "leaderboard",
  },
  {
    href: "/session-review",
    label: "View Session Result Card",
    description: "Review AI judge media and notes",
    icon: "review",
  },
];

export const STAFF_DISCLAIMER =
  "Final production version will allow staff review before scores are saved.";
