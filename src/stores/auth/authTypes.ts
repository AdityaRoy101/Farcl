export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  is_super_admin: boolean;
  orgName: string | null;
  profileCompleted: boolean;
}

export interface DecodedToken {
  userId?: string;
  sub?: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  tid?: string;
  exp: number;
}

export interface Tenant {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  orgId: string;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
}

export interface UserAssociations {
  tenants: Tenant[];
  workspaces: Workspace[];
  projects: Project[];
  defaultTenantId: string;
}

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  decodedTid: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Associations
  associations: UserAssociations | null;
  associationsLoading: boolean;
  associationsError: string | null;

  // Actions
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  refreshAccessToken: () => Promise<string | null>;
  initializeAuth: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  fetchUserAssociations: () => Promise<void>;
  clearAssociationsError: () => void;
}