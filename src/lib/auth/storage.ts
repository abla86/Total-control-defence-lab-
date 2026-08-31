import { User, AuthSession, SecurityBadge } from '../../types/auth';
import { syncHash } from '../simulation/crypto';

const USERS_STORAGE_KEY = 'agent_defense_users_vault_v1';
const SESSION_STORAGE_KEY = 'agent_defense_session_v1';

// Seed default users if none exist
const DEFAULT_USERS: Array<User & { passwordHash: string }> = [
  {
    id: 'usr_annebeth',
    email: 'annebeth.andersen@gmail.com',
    name: 'Anne-Beth Andersen',
    role: 'chief_security_officer',
    clearanceLevel: 9,
    xp: 4850,
    streakDays: 14,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedChallenges: ['challenge-2026-08-28', 'challenge-2026-08-29', 'challenge-2026-08-30'],
    earnedBadges: [
      {
        id: 'badge_zero_trust_architect',
        name: 'Zero-Trust Architect',
        description: 'Constructed an airtight multi-hop agent provenance boundary.',
        icon: 'ShieldAlert',
        earnedAt: '2026-08-20',
        rarity: 'legendary',
      },
      {
        id: 'badge_worm_neutralizer',
        name: 'Worm Hunter 2026',
        description: 'Successfully contained a Morris II autonomous recursive worm on Attempt 1.',
        icon: 'Bug',
        earnedAt: '2026-08-25',
        rarity: 'epic',
      },
    ],
    savedCustomRulesCount: 8,
    createdAt: '2026-08-01',
    passwordHash: syncHash('admin123_salt_agent_defense'),
  },
  {
    id: 'usr_researcher_demo',
    email: 'researcher@defense.lab',
    name: 'Dr. Alex Vance (Red Team)',
    role: 'red_team',
    clearanceLevel: 5,
    xp: 1800,
    streakDays: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedChallenges: ['challenge-2026-08-29'],
    earnedBadges: [
      {
        id: 'badge_red_team_operative',
        name: 'Red Team Operative',
        description: 'Evaluated NIST multi-attempt evasive attack matrices.',
        icon: 'Sparkles',
        earnedAt: '2026-08-29',
        rarity: 'rare',
      },
    ],
    savedCustomRulesCount: 3,
    createdAt: '2026-08-15',
    passwordHash: syncHash('demo123_salt_agent_defense'),
  },
];

export class AuthStorage {
  private static getUsers(): Array<User & { passwordHash: string }> {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS;
    }
  }

  private static saveUsers(users: Array<User & { passwordHash: string }>): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users to localStorage', e);
    }
  }

  static getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      // Ensure user details are synchronized with users storage
      const users = this.getUsers();
      const freshUser = users.find((u) => u.id === session.user.id);
      if (freshUser) {
        const { passwordHash, ...cleanUser } = freshUser;
        session.user = cleanUser;
      }
      return session;
    } catch {
      return null;
    }
  }

  static setSession(session: AuthSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to set session', e);
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }

  static login(email: string, passwordPlain: string): { success: boolean; session?: AuthSession; error?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const expectedHash = syncHash(`${passwordPlain}_salt_agent_defense`);
    if (user.passwordHash !== expectedHash) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    let newStreak = user.streakDays;
    if (user.lastActiveDate === yesterday) {
      newStreak += 1;
    } else if (user.lastActiveDate !== today) {
      newStreak = 1;
    }

    user.lastActiveDate = today;
    user.streakDays = newStreak;
    this.saveUsers(users);

    const { passwordHash, ...safeUser } = user;
    const token = `tok_${syncHash(`${user.id}_${Date.now()}_${Math.random()}`)}`;
    const session: AuthSession = {
      user: safeUser,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    this.setSession(session);
    return { success: true, session };
  }

  static signUp(
    email: string,
    passwordPlain: string,
    name: string,
    role: User['role'] = 'analyst'
  ): { success: boolean; session?: AuthSession; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (passwordPlain.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const today = new Date().toISOString().split('T')[0];
    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      role,
      clearanceLevel: 1,
      xp: 100, // Welcome XP bonus
      streakDays: 1,
      lastActiveDate: today,
      completedChallenges: [],
      earnedBadges: [
        {
          id: 'badge_novice_cadet',
          name: 'Defense Cadet',
          description: 'Joined the Agent Defense Lab security collective.',
          icon: 'ShieldCheck',
          earnedAt: today,
          rarity: 'common',
        },
      ],
      savedCustomRulesCount: 0,
      createdAt: today,
      passwordHash: syncHash(`${passwordPlain}_salt_agent_defense`),
    };

    users.push(newUser);
    this.saveUsers(users);

    const { passwordHash, ...safeUser } = newUser;
    const token = `tok_${syncHash(`${newUser.id}_${Date.now()}`)}`;
    const session: AuthSession = {
      user: safeUser,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    this.setSession(session);
    return { success: true, session };
  }

  static updateUserProgress(
    userId: string,
    xpGained: number,
    challengeId?: string,
    newBadge?: SecurityBadge
  ): User | null {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    const user = users[userIndex];
    user.xp += xpGained;

    // Recalculate clearance level (every 500 XP = +1 level, max 10)
    user.clearanceLevel = Math.min(10, Math.max(1, Math.floor(user.xp / 500) + 1));

    if (challengeId && !user.completedChallenges.includes(challengeId)) {
      user.completedChallenges.push(challengeId);
    }

    if (newBadge && !user.earnedBadges.some((b) => b.id === newBadge.id)) {
      user.earnedBadges.push(newBadge);
    }

    this.saveUsers(users);

    const { passwordHash, ...safeUser } = user;
    const session = this.getSession();
    if (session && session.user.id === userId) {
      session.user = safeUser;
      this.setSession(session);
    }

    return safeUser;
  }
}
