// src/contexts/workspace/types.ts

export type Tenant = {
  id: string;
  name: string;
};

export type Workspace = {
  id: string;
  name: string;
  orgId: string;
};

export type Project = {
  id: string;
  name: string;
  workspaceId: string;
};

export type OrgType = "STUDENT" | "PERSONAL" | "BUSINESS";

export type ProjectType = "FRONTEND" | "BACKEND" | "MONOREPO";

export interface ProjectDetails {
  id: string;
  name: string;
  repoLink: string;
  projectType: ProjectType;
  defaultBranch: string;
}

// ============= Org Context Types =============
export interface OrgContextValue {
  // Data
  tenants: Tenant[];
  defaultTenantId: string;

  // All entities (needed for nested contexts)
  allWorkspaces: Workspace[];
  allProjects: Project[];

  // Selection
  selectedOrgId: string;
  selectedOrg: Tenant | undefined;

  // Status
  isLoading: boolean;
  error: string;
  isSwitchingTenant: boolean;

  // Actions
  selectOrg: (orgId: string) => Promise<void>;
  createTenant: (name: string, type: OrgType) => Promise<void>;
  refreshAssociations: () => Promise<void>;
  clearError: () => void;
}

// ============= Workspace Context Types =============
export interface WorkspaceContextValue {
  // Data
  workspaces: Workspace[];
  filteredWorkspaces: Workspace[];

  // Selection
  selectedWorkspaceId: string;
  selectedWorkspace: Workspace | undefined;

  // Actions
  selectWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<void>;
}

// ============= Project Context Types =============
export interface ProjectContextValue {
  // Data
  projects: Project[];
  filteredProjects: Project[];

  // Selection
  selectedProjectId: string;
  selectedProject: Project | undefined;

  // Project Details
  selectedProjectDetails: ProjectDetails | null;
  isLoadingProjectDetails: boolean;

  // Actions
  selectProject: (projectId: string) => void;
  createProject: (name: string, projectType: "FRONTEND" | "BACKEND" | "MONOREPO", workspaceId?: string) => Promise<void>;
  fetchProjectDetails: (workspaceId: string, projectId: string) => Promise<void>;
}

// Legacy combined type for backward compatibility reference
export interface WorkspaceContextState {
  // Data
  tenants: Tenant[];
  workspaces: Workspace[];
  projects: Project[];
  defaultTenantId: string;

  // Selections
  selectedOrgId: string;
  selectedWorkspaceId: string;
  selectedProjectId: string;

  // Derived
  selectedOrg: Tenant | undefined;
  selectedWorkspace: Workspace | undefined;
  selectedProject: Project | undefined;
  filteredWorkspaces: Workspace[];
  filteredProjects: Project[];

  // Status
  isLoading: boolean;
  error: string;
  isSwitchingTenant: boolean;
}

export interface WorkspaceContextActions {
  // Selection actions
  selectOrg: (orgId: string) => Promise<void>;
  selectWorkspace: (workspaceId: string) => void;
  selectProject: (projectId: string) => void;

  // Create actions
  createTenant: (name: string, type: OrgType) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  createProject: (name: string, projectType: "FRONTEND" | "BACKEND" | "MONOREPO", workspaceId?: string) => Promise<void>;

  // Utility
  refreshAssociations: () => Promise<void>;
  clearError: () => void;
}

export type LegacyWorkspaceContextValue = WorkspaceContextState & WorkspaceContextActions;