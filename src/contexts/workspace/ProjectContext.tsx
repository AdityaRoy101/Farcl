// src/contexts/workspace/ProjectContext.tsx

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
import { useWorkspace } from "./WorkspaceContext";
import { CREATE_PROJECT_MUTATION } from "../../lib/graphql/mutations/CreateProjectMut";
import { PROJECT_DETAILS_MUTATION } from "../../lib/graphql/mutations/ProjectDetailsMut";
import type { ProjectContextValue, ProjectDetails } from "./types";
import { apiFetch } from "../../lib/api/apiFetch";
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

// LocalStorage keys
const STORAGE_KEYS = {
    SELECTED_PROJECT: "farcl_selected_project",
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
const ProjectContext = createContext<ProjectContextValue | null>(null);

// Provider props
interface ProjectProviderProps {
    children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
    const { allProjects, isLoading: orgLoading, refreshAssociations } = useOrg();
    const { selectedWorkspaceId } = useWorkspace();

    const isInitialMount = useRef(true);

    // Selection state
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    // Project details state
    const [selectedProjectDetails, setSelectedProjectDetails] = useState<ProjectDetails | null>(null);
    const [isLoadingProjectDetails, setIsLoadingProjectDetails] = useState(false);

    // Filter projects by selected workspace
    const filteredProjects = useMemo(
        () => (selectedWorkspaceId ? allProjects.filter((p) => p.workspaceId === selectedWorkspaceId) : []),
        [allProjects, selectedWorkspaceId]
    );

    // When workspace changes, clear project selection if it doesn't belong to new workspace
    useEffect(() => {
        if (selectedProjectId && filteredProjects.length > 0) {
            const stillValid = filteredProjects.some((p) => p.id === selectedProjectId);
            if (!stillValid) {
                setSelectedProjectId("");
            }
        } else if (!selectedWorkspaceId) {
            setSelectedProjectId("");
        }
    }, [selectedWorkspaceId, filteredProjects, selectedProjectId]);

    // Restore project selection from localStorage on initial load
    useEffect(() => {
        if (isInitialMount.current && !orgLoading && selectedWorkspaceId && filteredProjects.length > 0) {
            const savedId = getSavedSelection(STORAGE_KEYS.SELECTED_PROJECT);
            if (savedId && filteredProjects.some((p) => p.id === savedId)) {
                setSelectedProjectId(savedId);
            }
            isInitialMount.current = false;
        }
    }, [orgLoading, selectedWorkspaceId, filteredProjects]);

    // Persist project selection to localStorage
    useEffect(() => {
        if (!isInitialMount.current) {
            saveSelection(STORAGE_KEYS.SELECTED_PROJECT, selectedProjectId);
        }
    }, [selectedProjectId]);

    // Derived values
    const selectedProject = useMemo(
        () => filteredProjects.find((p) => p.id === selectedProjectId),
        [filteredProjects, selectedProjectId]
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
    const selectProject = useCallback((projectId: string) => {
        setSelectedProjectId(projectId);
    }, []);

    const createProject = useCallback(
        async (name: string, projectType: "FRONTEND" | "BACKEND" | "MONOREPO", workspaceId?: string) => {
            const wsId = workspaceId || selectedWorkspaceId;
            if (!name.trim() || !wsId) return;

            try {
                await graphqlRequest(CREATE_PROJECT_MUTATION, {
                    wid: wsId,
                    projectName: name.trim(),
                    projectType: projectType,
                });
                await refreshAssociations();
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Failed to create project";
                throw new Error(msg);
            }
        },
        [graphqlRequest, refreshAssociations, selectedWorkspaceId]
    );

    // Fetch project details
    const fetchProjectDetails = useCallback(
        async (workspaceId: string, projectId: string) => {
            if (!workspaceId || !projectId) {
                setSelectedProjectDetails(null);
                return;
            }

            setIsLoadingProjectDetails(true);
            try {
                const data = await graphqlRequest<{ projectDetails: ProjectDetails }>(
                    PROJECT_DETAILS_MUTATION,
                    { wid: workspaceId, pid: projectId }
                );
                setSelectedProjectDetails(data.projectDetails);
            } catch (e) {
                console.error("Failed to fetch project details:", e);
                setSelectedProjectDetails(null);
            } finally {
                setIsLoadingProjectDetails(false);
            }
        },
        [graphqlRequest]
    );

    // Auto-fetch project details when project selection changes
    useEffect(() => {
        if (selectedProjectId && selectedWorkspaceId) {
            fetchProjectDetails(selectedWorkspaceId, selectedProjectId);
        } else {
            setSelectedProjectDetails(null);
        }
    }, [selectedProjectId, selectedWorkspaceId, fetchProjectDetails]);

    const value: ProjectContextValue = useMemo(
        () => ({
            projects: allProjects,
            filteredProjects,
            selectedProjectId,
            selectedProject,
            selectedProjectDetails,
            isLoadingProjectDetails,
            selectProject,
            createProject,
            fetchProjectDetails,
        }),
        [
            allProjects,
            filteredProjects,
            selectedProjectId,
            selectedProject,
            selectedProjectDetails,
            isLoadingProjectDetails,
            selectProject,
            createProject,
            fetchProjectDetails,
        ]
    );

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// Custom hook
export function useProject(): ProjectContextValue {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}

// Export context for edge cases
export { ProjectContext };
