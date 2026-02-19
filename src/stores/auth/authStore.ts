import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import type { AuthState, User, DecodedToken, Tenant, Workspace, Project } from "./authTypes";
import { USER_PROFILE_ASSOCIATIONS_MUTATION } from "../../lib/graphql/mutations/UserAssociationsMut";
import { REFRESH_MUTATION } from "../../lib/graphql/mutations/Refresh/Refresh";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;



// Helper functions
interface GraphQLError {
  message?: string;
}

interface GraphQLResponse {
  body?: {
    singleResult?: {
      errors?: GraphQLError[];
      data?: Record<string, unknown>;
    };
  };
  errors?: GraphQLError[];
  data?: Record<string, unknown>;
}

interface AssociationsResponse {
  entities?: {
    tenants?: Record<string, Tenant>;
    workspaces?: Record<string, Workspace>;
    projects?: Record<string, Project>;
  };
  name?: string;
  email?: string;
  profileImage?: string | null;
  defaultTenantId?: string;
}

function getGqlErrors(json: GraphQLResponse): Array<{ message?: string }> {
  return json?.body?.singleResult?.errors ?? json?.errors ?? [];
}

function getGqlData(json: GraphQLResponse): Record<string, unknown> | null {
  return json?.body?.singleResult?.data ?? json?.data ?? null;
}

function safeJsonParse<T>(value: unknown): T | null {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// Token utility functions
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Ensure token consistency between localStorage and store
const ensureTokenConsistency = () => {
  const storedToken = localStorage.getItem("accessToken");
  const currentToken = useAuthStore.getState().token;

  // If localStorage has no token but store does, clear store (logout)
  if (!storedToken && currentToken) {
    console.warn("Token inconsistency detected: localStorage missing token, logging out");
    useAuthStore.getState().logout();
    return false;
  }

  // If localStorage has different token, update store
  if (storedToken && storedToken !== currentToken) {
    console.warn("Token inconsistency detected: updating store with localStorage token");
    const user = buildUserFromToken(storedToken);
    const decodedTid = extractTidFromToken(storedToken);
    useAuthStore.setState({
      token: storedToken,
      user,
      decodedTid
    });
    return true;
  }

  return true;
};

const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const expiresIn = decoded.exp * 1000 - Date.now();
    return expiresIn < 5 * 60 * 1000; // 5 minutes
  } catch {
    return true;
  }
};

const extractTidFromToken = (token: string): string | null => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.tid || null;
  } catch {
    return null;
  }
};

const buildUserFromToken = (token: string): User => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return {
      id: decoded.userId || decoded.sub || "",
      name: decoded.name || "",
      email: decoded.email || "",
      profileImage: null,
      is_super_admin: decoded.isAdmin ?? false,
      orgName: null,
      profileCompleted: false,
    };
  } catch {
    return {
      id: "",
      name: "",
      email: "",
      profileImage: null,
      is_super_admin: false,
      orgName: null,
      profileCompleted: false,
    };
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      decodedTid: null,
      isLoading: true,
      isInitialized: false,

      // Associations State
      associations: null,
      associationsLoading: false,
      associationsError: null,

      // Actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearAssociationsError: () => set({ associationsError: null }),

      login: (token: string, user: User, refreshToken?: string) => {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        const decodedTid = extractTidFromToken(token);

        set({
          token,
          user,
          decodedTid,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // Ignore logout API errors
        }

        // Clear localStorage
        const keysToRemove = [
          "accessToken",
          "refreshToken",
          "auth-storage",
          "farcl_selected_org",
          "farcl_selected_workspace",
          "farcl_selected_project",
          "farcl_github_connect_state",
        ];
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }

        set({
          user: null,
          token: null,
          decodedTid: null,
          isLoading: false,
          associations: null,
          associationsError: null,
        });
      },

      updateTokens: (accessToken: string, refreshToken?: string) => {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        const decodedTid = extractTidFromToken(accessToken);

        set({
          token: accessToken,
          decodedTid,
        });
      },

      refreshAccessToken: async (): Promise<string | null> => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return null;

        try {
          const res = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${refreshToken}`,
            },
            body: JSON.stringify({
              query: REFRESH_MUTATION,
            }),
          });

          const json = await res.json();
          const raw = json.body?.singleResult?.data?.refresh || json.data?.refresh;

          if (!raw) return null;

          const result = typeof raw === "string" ? JSON.parse(raw) : raw;

          if (result.success && result.data?.accessToken) {
            const { accessToken, refreshToken: newRefreshToken } = result.data;

            get().updateTokens(accessToken, newRefreshToken);

            // Update user from new token
            const user = buildUserFromToken(accessToken);
            set({ user });

            return accessToken;
          }

          return null;
        } catch {
          return null;
        }
      },

      fetchUserAssociations: async () => {
        // Ensure token consistency before making API call
        if (!ensureTokenConsistency()) {
          set({ associationsError: "Authentication inconsistency detected" });
          return;
        }

        const { token } = get();

        if (!token) {
          set({ associationsError: "No access token available" });
          return;
        }

        set({ associationsLoading: true, associationsError: null });

        try {
          const res = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query: USER_PROFILE_ASSOCIATIONS_MUTATION }),
          });

          const json = await res.json();
          const errors = getGqlErrors(json);

          if (errors?.length) {
            throw new Error(errors[0]?.message || "Request failed");
          }

          const data = getGqlData(json);
          const raw = data?.getUserProfileAssociations;

          // Parse the response
          let parsed: AssociationsResponse;
          if (typeof raw === "string") {
            const parsedJson = safeJsonParse<AssociationsResponse>(raw);
            if (!parsedJson) {
              throw new Error("Invalid associations response");
            }
            parsed = parsedJson;
          } else if (raw && typeof raw === "object") {
            parsed = raw as AssociationsResponse;
          } else {
            throw new Error("Invalid associations response");
          }

          // Extract entities
          const entities = parsed.entities ?? {};
          const tenantMap = entities.tenants ?? {};
          const workspaceMap = entities.workspaces ?? {};
          const projectMap = entities.projects ?? {};

          const tenantList = Object.values(tenantMap) as Tenant[];
          const workspaceList = Object.values(workspaceMap) as Workspace[];
          const projectList = Object.values(projectMap) as Project[];

          // Update user with profile data from API (name, email, profileImage are at root level)
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                name: parsed.name || currentUser.name,
                email: parsed.email || currentUser.email,
                profileImage: parsed.profileImage || null,
              },
            });
          }

          // Set associations
          set({
            associations: {
              tenants: tenantList,
              workspaces: workspaceList,
              projects: projectList,
              defaultTenantId: parsed.defaultTenantId ?? "",
            },
            associationsLoading: false,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to load profile associations";
          set({
            associationsError: msg,
            associationsLoading: false,
          });
        }
      },

      initializeAuth: async () => {
        const { isInitialized } = get();
        if (isInitialized) return;

        set({ isLoading: true });

        const savedToken = localStorage.getItem("accessToken");

        if (!savedToken) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        let activeToken = savedToken;

        // Check if token is expired and try to refresh
        if (isTokenExpired(savedToken)) {
          const newToken = await get().refreshAccessToken();
          if (!newToken) {
            // Keep the expired token to avoid logout; API calls will attempt refresh
            activeToken = savedToken;
          } else {
            activeToken = newToken;
          }
        }

        // Set auth state from token
        const user = buildUserFromToken(activeToken);
        const decodedTid = extractTidFromToken(activeToken);

        set({
          token: activeToken,
          user,
          decodedTid,
          isLoading: false,
          isInitialized: true,
        });

        // Fetch user associations after auth is initialized
        get().fetchUserAssociations();
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        token: state.token,
        user: state.user,
        decodedTid: state.decodedTid,
        associations: state.associations,
      }),
    }
  )
);

// Auto-refresh token setup (call this once in App)
let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const setupTokenRefresh = () => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Check and refresh every minute
  refreshInterval = setInterval(async () => {
    // Ensure token consistency every minute
    ensureTokenConsistency();

    const { token, refreshAccessToken } = useAuthStore.getState();
    if (token && isTokenExpiringSoon(token)) {
      await refreshAccessToken();
    }
  }, 60 * 1000);

  // Handle visibility change
  const handleVisibilityChange = async () => {
    if (document.visibilityState === "visible") {
      // Ensure token consistency when tab becomes active
      ensureTokenConsistency();

      const { token, refreshAccessToken } = useAuthStore.getState();
      if (token && isTokenExpired(token)) {
        // Attempt refresh; if failed, keep expired token (API calls will retry)
        await refreshAccessToken();
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Return cleanup function
  return () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
};

// Selectors for optimized re-renders
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectDecodedTid = (state: AuthState) => state.decodedTid;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsAuthenticated = (state: AuthState) => !!state.token;
export const selectAssociations = (state: AuthState) => state.associations;
export const selectAssociationsLoading = (state: AuthState) => state.associationsLoading;
export const selectAssociationsError = (state: AuthState) => state.associationsError;
