// src/contexts/workspace/WorkspaceContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { useOrg } from "./OrgContext";
import { CREATE_WORKSPACE_MUTATION } from "../../lib/graphql/mutations/CreateWorkspaceMut";
import type { WorkspaceContextValue } from "./types";
import { apiFetch } from "../../lib/api/apiFetch";
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

// LocalStorage keys
const STORAGE_KEYS = {
  SELECTED_WORKSPACE: "farcl_selected_workspace",
} as const;

function getSavedSelection(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function saveSelection(key: string, value: string): void {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
}

// Helper functions for GraphQL
function getGqlErrors(json: any): Array<{ message?: string }> {
  return json?.body?.singleResult?.errors ?? json?.errors ?? [];
}

function getGqlData(json: any): any {
  return json?.body?.singleResult?.data ?? json?.data ?? null;
}

// Create context
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// Provider props
interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { selectedOrgId, allWorkspaces, isLoading: orgLoading, refreshAssociations } = useOrg();

  const isInitialMount = useRef(true);

  // Selection state
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  // Filter workspaces by selected org
  const filteredWorkspaces = useMemo(
    () => (selectedOrgId ? allWorkspaces.filter((w) => w.orgId === selectedOrgId) : allWorkspaces),
    [allWorkspaces, selectedOrgId]
  );

  // When org changes, clear workspace selection if it doesn't belong to new org
  useEffect(() => {
    if (selectedWorkspaceId && filteredWorkspaces.length > 0) {
      const stillValid = filteredWorkspaces.some((w) => w.id === selectedWorkspaceId);
      if (!stillValid) {
        setSelectedWorkspaceId("");
      }
    }
  }, [selectedOrgId, filteredWorkspaces, selectedWorkspaceId]);

  // Restore workspace selection from localStorage on initial load
  useEffect(() => {
    if (isInitialMount.current && !orgLoading && filteredWorkspaces.length > 0) {
      const savedId = getSavedSelection(STORAGE_KEYS.SELECTED_WORKSPACE);
      if (savedId && filteredWorkspaces.some((w) => w.id === savedId)) {
        setSelectedWorkspaceId(savedId);
      }
      isInitialMount.current = false;
    }
  }, [orgLoading, filteredWorkspaces]);

  // Persist workspace selection to localStorage
  useEffect(() => {
    if (!isInitialMount.current) {
      saveSelection(STORAGE_KEYS.SELECTED_WORKSPACE, selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  // Derived values
  const selectedWorkspace = useMemo(
    () => filteredWorkspaces.find((w) => w.id === selectedWorkspaceId),
    [filteredWorkspaces, selectedWorkspaceId]
  );

  // Get access token
  const getAccessToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);

  // GraphQL request
  const graphqlRequest = useCallback(
    async <T,>(query: string, variables?: Record<string, any>): Promise<T> => {
      if (!GRAPHQL_URL) throw new Error("Missing VITE_GRAPHQL_URL");

      const res = await apiFetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const json = await res.json();
      const errors = getGqlErrors(json);
      if (errors?.length) throw new Error(errors[0]?.message || "Request failed");

      return getGqlData(json) as T;
    },
    []
  );

  // Actions
  const selectWorkspace = useCallback((workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  }, []);

  const createWorkspace = useCallback(
    async (name: string) => {
      if (!name.trim()) return;

      try {
        await graphqlRequest(CREATE_WORKSPACE_MUTATION, { workspaceName: name.trim() });
        await refreshAssociations();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to create workspace";
        throw new Error(msg);
      }
    },
    [graphqlRequest, refreshAssociations]
  );

  // Context value
  const value: WorkspaceContextValue = useMemo(
    () => ({
      workspaces: allWorkspaces,
      filteredWorkspaces,
      selectedWorkspaceId,
      selectedWorkspace,
      selectWorkspace,
      createWorkspace,
    }),
    [
      allWorkspaces,
      filteredWorkspaces,
      selectedWorkspaceId,
      selectedWorkspace,
      selectWorkspace,
      createWorkspace,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// Custom hook
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

// Export context for edge cases
export { WorkspaceContext };