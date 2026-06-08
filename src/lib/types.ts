export type BadgeVariant = "gold" | "blue" | "green" | "purple" | "orange";

export type LeaderboardMode = "cabin" | "camper";

export interface CabinBadge {
  id: string;
  label: string;
  variant: BadgeVariant;
}

export interface Cabin {
  id: string;
  number: number;
  name: string;
  mascot: string;
  points: number;
  rank: number;
  badges?: CabinBadge[];
  isHighlighted?: boolean;
}

export interface Camper {
  id: string;
  name: string;
  cabinNumber: number;
  cabinName: string;
  points: number;
  rank: number;
  isHighlighted?: boolean;
}

export interface ScoreBreakdown {
  rageScore: number;
  rageScoreMax: number;
  destructionLevel: number;
  teamEnergy: number;
  teamEnergyMax: number;
  safetyDiscipline: number;
  safetyDisciplineMax: number;
  creativityBonus: number;
  totalScore: number;
}

export interface RankMovement {
  previousRank: number;
  currentRank: number;
}

export interface SessionResult {
  id: string;
  cabin: Cabin;
  camper: string;
  scores: ScoreBreakdown;
  rankMovement: RankMovement;
  aiNotes: string[];
  sessionComplete: boolean;
}

export interface DemoNavItem {
  href: string;
  label: string;
  description: string;
  icon: "rage" | "leaderboard" | "review" | "home";
}
