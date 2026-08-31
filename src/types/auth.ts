export interface User {
  id: string;
  email: string;
  name: string;
  role: 'analyst' | 'red_team' | 'blue_team_lead' | 'chief_security_officer';
  avatar?: string;
  clearanceLevel: number; // 1 - 10
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedChallenges: string[]; // Challenge IDs
  earnedBadges: SecurityBadge[];
  savedCustomRulesCount: number;
  createdAt: string;
}

export interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
