// src/contexts/workspace/OrgContext.tsx

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
import { useAuthStore } from "../../stores/auth";
import { apiFetch } from "../../lib/api/apiFetch";
import { CREATE_TENANT_MUTATION } from "../../lib/graphql/mutations/CreateTenantMut";
import { SWITCH_TENANTS_MUTATION } from "../../lib/graphql/mutations/SwitchTenantsMut";
import { USER_PROFILE_ASSOCIATIONS_MUTATION } from "../../lib/graphql/mutations/UserAssociationsMut";
import type {
    Tenant,
    Workspace,
    Project,
    OrgType,
    OrgContextValue,
} from "./types";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;

// LocalStorage keys
const STORAGE_KEYS = {
    SELECTED_ORG: "farcl_selected_org",
    SELECTED_WORKSPACE: "farcl_selected_workspace",
    SELECTED_PROJECT: "farcl_selected_project",
} as const;

// Helper functions
function getGqlErrors(json: any): Array<{ message?: string }> {
    return json?.body?.singleResult?.errors ?? json?.errors ?? [];
}

function getGqlData(json: any): any {
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

// Create context
const OrgContext = createContext<OrgContextValue | null>(null);

// Provider props
interface OrgProviderProps {
    children: ReactNode;
}

export function OrgProvider({ children }: OrgProviderProps) {
    const token = useAuthStore((state) => state.token);
    const decodedTid = useAuthStore((state) => state.decodedTid);
    const updateTokens = useAuthStore((state) => state.updateTokens);

    // Refs to prevent race conditions / loops
    const isInitialMount = useRef(true);
    const isSwitchingTenantRef = useRef(false);
    const hasRestoredSelections = useRef(false);
    const lastLoadedTidRef = useRef<string | null>(null);

    // Data state
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [defaultTenantId, setDefaultTenantId] = useState<string>("");

    // Selection state
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");

    // Status state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [isSwitchingTenant, setIsSwitchingTenant] = useState(false);

    // Persist org selection to localStorage
    useEffect(() => {
        if (!isInitialMount.current) {
            saveSelection(STORAGE_KEYS.SELECTED_ORG, selectedOrgId);
        }
    }, [selectedOrgId]);

    // Derived values
    const selectedOrg = useMemo(
        () => tenants.find((t) => t.id === selectedOrgId),
        [tenants, selectedOrgId]
    );

    // Helper: Get tokens from localStorage (always fresh)
    const getAccessToken = useCallback(() => {
        return localStorage.getItem("accessToken") || token;
    }, [token]);

    const getRefreshToken = useCallback(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            throw new Error("No refresh token found. Please login again.");
        }
        return refreshToken;
    }, []);

    // GraphQL request with ACCESS TOKEN
    const graphqlRequest = useCallback(
        async <T,>(
            query: string,
            variables?: Record<string, any>,
            customToken?: string
        ): Promise<T> => {
            if (!GRAPHQL_URL) throw new Error("Missing VITE_GRAPHQL_URL");

            const options: RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, variables }),
            };

            if (customToken) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${customToken}`,
                };
            }

            const res = await apiFetch(GRAPHQL_URL, options);

            const json = await res.json();
            const errors = getGqlErrors(json);
            if (errors?.length) throw new Error(errors[0]?.message || "Request failed");

            return getGqlData(json) as T;
        },
        []
    );

    // GraphQL request with REFRESH TOKEN (for switchTenants API)
    const graphqlRequestWithRefreshToken = useCallback(
        async <T,>(query: string, variables?: Record<string, any>): Promise<T> => {
            if (!GRAPHQL_URL) throw new Error("Missing VITE_GRAPHQL_URL");

            const refreshToken = getRefreshToken();

            const res = await fetch(GRAPHQL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
                body: JSON.stringify({ query, variables }),
            });

            const json = await res.json();
            const errors = getGqlErrors(json);
            if (errors?.length) throw new Error(errors[0]?.message || "Request failed");

            return getGqlData(json) as T;
        },
        [getRefreshToken]
    );

    // Fetch associations data
    const fetchAssociationsData = useCallback(
        async (customToken?: string) => {
            type AssocResponse = {
                getUserProfileAssociations: any;
            };

            const data = await graphqlRequest<AssocResponse>(
                USER_PROFILE_ASSOCIATIONS_MUTATION,
                undefined,
                customToken
            );

            const raw = data?.getUserProfileAssociations;
            const parsed = typeof raw === "string" ? safeJsonParse<any>(raw) ?? raw : raw;

            if (typeof parsed === "string" || !parsed) {
                throw new Error("Invalid associations response");
            }

            return parsed;
        },
        [graphqlRequest]
    );

    // Switch tenant using REFRESH TOKEN
    const switchToTenant = useCallback(
        async (tenantId: string): Promise<{ accessToken: string; refreshToken: string }> => {
            type SwitchResponse = {
                switchTenants: {
                    success: boolean;
                    data?: {
                        accessToken: string;
                        refreshToken: string;
                    };
                };
            };

            const data = await graphqlRequestWithRefreshToken<SwitchResponse>(
                SWITCH_TENANTS_MUTATION,
                { tid: tenantId }
            );

            const result = data?.switchTenants;

            if (!result?.success || !result?.data) {
                throw new Error("Failed to switch tenant");
            }

            const { accessToken, refreshToken } = result.data;

            if (!accessToken || !refreshToken) {
                throw new Error("Tokens missing from switch response");
            }

            updateTokens(accessToken, refreshToken);

            return { accessToken, refreshToken };
        },
        [graphqlRequestWithRefreshToken, updateTokens]
    );

    // Initial load
    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        if (isSwitchingTenantRef.current) {
            return;
        }

        if (
            decodedTid &&
            hasRestoredSelections.current &&
            lastLoadedTidRef.current === decodedTid
        ) {
            return;
        }

        let isCancelled = false;

        const loadInitialData = async () => {
            setIsLoading(true);
            setError("");

            try {
                const savedOrgId = getSavedSelection(STORAGE_KEYS.SELECTED_ORG);

                let associationsData = await fetchAssociationsData();

                if (isCancelled) return;

                const entities = associationsData.entities ?? {};
                const tenantMap = entities.tenants ?? {};
                const workspaceMap = entities.workspaces ?? {};
                const projectMap = entities.projects ?? {};

                let tenantList = Object.values(tenantMap) as Tenant[];
                let workspaceList = Object.values(workspaceMap) as Workspace[];
                let projectList = Object.values(projectMap) as Project[];

                const tenantExists = (id: string) => tenantList.some((t) => t.id === id);

                let targetOrgId = "";
                if (savedOrgId && tenantExists(savedOrgId)) targetOrgId = savedOrgId;
                else if (decodedTid && tenantExists(decodedTid)) targetOrgId = decodedTid;
                else if (associationsData.defaultTenantId && tenantExists(associationsData.defaultTenantId))
                    targetOrgId = associationsData.defaultTenantId;
                else targetOrgId = tenantList[0]?.id || "";

                if (
                    targetOrgId &&
                    decodedTid &&
                    targetOrgId !== decodedTid &&
                    tenantExists(targetOrgId)
                ) {
                    isSwitchingTenantRef.current = true;
                    setIsSwitchingTenant(true);

                    try {
                        const { accessToken } = await switchToTenant(targetOrgId);
                        if (isCancelled) return;

                        associationsData = await fetchAssociationsData(accessToken);
                        if (isCancelled) return;

                        const newEntities = associationsData.entities ?? {};
                        tenantList = Object.values(newEntities.tenants ?? {}) as Tenant[];
                        workspaceList = Object.values(newEntities.workspaces ?? {}) as Workspace[];
                        projectList = Object.values(newEntities.projects ?? {}) as Project[];
                    } finally {
                        isSwitchingTenantRef.current = false;
                        setIsSwitchingTenant(false);
                    }
                }

                if (isCancelled) return;

                // Set state
                setTenants(tenantList);
                setAllWorkspaces(workspaceList);
                setAllProjects(projectList);
                setDefaultTenantId(associationsData.defaultTenantId ?? "");
                setSelectedOrgId(targetOrgId);

                hasRestoredSelections.current = true;
                isInitialMount.current = false;
                lastLoadedTidRef.current = targetOrgId || decodedTid || null;
            } catch (e: unknown) {
                if (!isCancelled) {
                    const msg = e instanceof Error ? e.message : "Failed to load data";
                    setError(msg);
                    isInitialMount.current = false;
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isCancelled = true;
        };
    }, [token, decodedTid, fetchAssociationsData, switchToTenant]);

    // Actions
    const selectOrg = useCallback(
        async (orgId: string) => {
            if (orgId === selectedOrgId) return;
            if (isSwitchingTenantRef.current) return;

            if (decodedTid && orgId === decodedTid) {
                setSelectedOrgId(orgId);
                lastLoadedTidRef.current = orgId;
                hasRestoredSelections.current = true;
                return;
            }

            isSwitchingTenantRef.current = true;
            setIsSwitchingTenant(true);
            setIsLoading(true);
            setError("");

            try {
                const { accessToken } = await switchToTenant(orgId);

                lastLoadedTidRef.current = orgId;
                hasRestoredSelections.current = true;

                const newData = await fetchAssociationsData(accessToken);

                const entities = newData.entities ?? {};
                const tenantMap = entities.tenants ?? {};
                const workspaceMap = entities.workspaces ?? {};
                const projectMap = entities.projects ?? {};

                setTenants(Object.values(tenantMap) as Tenant[]);
                setAllWorkspaces(Object.values(workspaceMap) as Workspace[]);
                setAllProjects(Object.values(projectMap) as Project[]);
                setDefaultTenantId(newData.defaultTenantId ?? "");
                setSelectedOrgId(orgId);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Failed to switch organization";
                setError(msg);
            } finally {
                setIsLoading(false);
                setIsSwitchingTenant(false);
                isSwitchingTenantRef.current = false;
            }
        },
        [selectedOrgId, decodedTid, switchToTenant, fetchAssociationsData]
    );

    const refreshAssociations = useCallback(async () => {
        if (isSwitchingTenantRef.current) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await fetchAssociationsData();
            const entities = data.entities ?? {};

            setTenants(Object.values(entities.tenants ?? {}) as Tenant[]);
            setAllWorkspaces(Object.values(entities.workspaces ?? {}) as Workspace[]);
            setAllProjects(Object.values(entities.projects ?? {}) as Project[]);
            setDefaultTenantId(data.defaultTenantId ?? "");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to refresh data";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAssociationsData]);

    const createTenant = useCallback(
        async (name: string, type: OrgType) => {
            if (!name.trim()) return;

            isSwitchingTenantRef.current = true;
            setIsSwitchingTenant(true);
            setError("");

            try {
                await graphqlRequest(CREATE_TENANT_MUTATION, {
                    tenantName: name.trim(),
                    tenantType: type,
                });

                const assocData = await fetchAssociationsData();
                const tenantMap = assocData.entities?.tenants ?? {};
                const tenantList = Object.values(tenantMap) as Tenant[];
                const newTenant = tenantList.find((t) => t.name === name.trim());

                if (!newTenant) {
                    throw new Error("Could not find newly created organization");
                }

                const { accessToken } = await switchToTenant(newTenant.id);

                lastLoadedTidRef.current = newTenant.id;
                hasRestoredSelections.current = true;

                const newData = await fetchAssociationsData(accessToken);
                const entities = newData.entities ?? {};

                setTenants(Object.values(entities.tenants ?? {}) as Tenant[]);
                setAllWorkspaces(Object.values(entities.workspaces ?? {}) as Workspace[]);
                setAllProjects(Object.values(entities.projects ?? {}) as Project[]);
                setDefaultTenantId(newData.defaultTenantId ?? "");
                setSelectedOrgId(newTenant.id);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Failed to create organization";
                setError(msg);
                throw e;
            } finally {
                setIsSwitchingTenant(false);
                isSwitchingTenantRef.current = false;
            }
        },
        [graphqlRequest, fetchAssociationsData, switchToTenant]
    );

    const clearError = useCallback(() => {
        setError("");
    }, []);

    // Context value
    const value: OrgContextValue = useMemo(
        () => ({
            // Data
            tenants,
            defaultTenantId,
            allWorkspaces,
            allProjects,

            // Selection
            selectedOrgId,
            selectedOrg,

            // Status
            isLoading,
            error,
            isSwitchingTenant,

            // Actions
            selectOrg,
            createTenant,
            refreshAssociations,
            clearError,
        }),
        [
            tenants,
            defaultTenantId,
            allWorkspaces,
            allProjects,
            selectedOrgId,
            selectedOrg,
            isLoading,
            error,
            isSwitchingTenant,
            selectOrg,
            createTenant,
            refreshAssociations,
            clearError,
        ]
    );

    return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

// Custom hook
export function useOrg(): OrgContextValue {
    const context = useContext(OrgContext);
    if (!context) {
        throw new Error("useOrg must be used within an OrgProvider");
    }
    return context;
}

// Export context for edge cases
export { OrgContext };
