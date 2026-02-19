// src/modules/explore/Explore.tsx

import { useMemo, useState } from "react";
import { Plus, Github, Globe, Settings, Search, Rocket, Building2 } from "lucide-react";
import { useOrg, useWorkspace, useProject } from "../../contexts/workspace";
import type { OrgType, ProjectType, Workspace, Project } from "../../contexts/workspace";
import { Header } from "../../components/Header/Header";
import {
  HeaderSkeleton,
  SidebarSkeleton,
  ChecklistSkeleton,
} from "../../components/Skeleton/Skeleton";
import { ExploreMainSection } from "./ExploreMainSection";
import { ExploreCreateModals } from "./ExploreCreateModals";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Explore() {
  // Use separate context hooks
  const {
    selectedOrgId,
    selectedOrg,
    isLoading,
    error,
    createTenant,
    clearError,
  } = useOrg();

  const {
    filteredWorkspaces,
    selectedWorkspaceId,
    selectedWorkspace,
    selectWorkspace,
    createWorkspace,
  } = useWorkspace();

  const {
    projects,
    filteredProjects,
    selectedProjectId,
    selectedProject,
    selectProject,
    createProject,
    selectedProjectDetails,
    isLoadingProjectDetails,
  } = useProject();

  // Modal states
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("FRONTEND");
  const [creatingProject, setCreatingProject] = useState(false);

  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [tenantType, setTenantType] = useState<OrgType>("PERSONAL");
  const [creatingTenant, setCreatingTenant] = useState(false);

  const hasFilteredWorkspaces = filteredWorkspaces.length > 0;
  const hasFilteredProjects = filteredProjects.length > 0;

  const selectionState = useMemo(() => {
    if (!selectedOrgId) return "no-org";
    if (!hasFilteredWorkspaces) return "no-workspaces";
    if (!selectedWorkspaceId) return "select-workspace";
    if (!hasFilteredProjects) return "no-projects";
    if (!selectedProjectId) return "select-project";
    return "project-selected";
  }, [
    selectedOrgId,
    hasFilteredWorkspaces,
    selectedWorkspaceId,
    hasFilteredProjects,
    selectedProjectId,
  ]);

  const checklistItems = useMemo(() => {
    if (!hasFilteredWorkspaces) {
      return [
        { text: "Create your first workspace", icon: Plus, done: false },
        { text: "Connect GitHub repository", icon: Github, done: false },
        { text: "Deploy your frontend", icon: Rocket, done: false },
        { text: "Add environment variables", icon: Settings, done: false },
        { text: "Connect custom domain", icon: Globe, done: false },
      ];
    }

    return [
      { text: "Create your first project", icon: Plus, done: false },
      { text: "Connect GitHub repository", icon: Github, done: false },
      { text: "Deploy your frontend", icon: Rocket, done: false },
      { text: "Add environment variables", icon: Settings, done: false },
      { text: "Connect custom domain", icon: Globe, done: false },
    ];
  }, [hasFilteredWorkspaces]);

  // Open modal handlers
  const openCreateWorkspace = () => {
    setWorkspaceName("");
    setWorkspaceModalOpen(true);
  };

  const openCreateProject = () => {
    if (filteredWorkspaces.length === 0) {
      openCreateWorkspace();
      return;
    }

    // ensure workspace is selected so the create-project modal has a valid workspace
    if (!selectedWorkspaceId) {
      selectWorkspace(filteredWorkspaces[0].id);
    }

    setProjectName("");
    setProjectType("FRONTEND");
    setProjectModalOpen(true);
  };

  const openCreateTenant = () => {
    setTenantName("");
    setTenantType("PERSONAL");
    setTenantModalOpen(true);
  };

  // Submit handlers
  const submitCreateWorkspace = async () => {
    const name = workspaceName.trim();
    if (!name) return;

    setCreatingWorkspace(true);
    try {
      await createWorkspace(name);
      setWorkspaceModalOpen(false);
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const submitCreateProject = async () => {
    const pname = projectName.trim();
    if (!pname || !selectedWorkspaceId) return;

    setCreatingProject(true);
    try {
      await createProject(pname, projectType, selectedWorkspaceId);
      setProjectModalOpen(false);
    } finally {
      setCreatingProject(false);
    }
  };

  const submitCreateTenant = async () => {
    const name = tenantName.trim();
    if (!name) return;

    setCreatingTenant(true);
    try {
      await createTenant(name, tenantType);
      setTenantModalOpen(false);
    } finally {
      setCreatingTenant(false);
    }
  };

  // Sidebar computed values
  const sidebarTitle = hasFilteredWorkspaces ? "Recent Projects" : "Recent Workspaces";
  const sidebarItems = hasFilteredWorkspaces
    ? filteredProjects.slice(0, 3).map((p: Project) => p.name)
    : filteredWorkspaces.slice(0, 3).map((w: Workspace) => w.name);
  const sidebarSearchPlaceholder = hasFilteredWorkspaces
    ? "Search projects..."
    : "Search workspaces...";

  // Sidebar (page sidebar, not the app switcher)
  const renderSidebar = () => {
    if (isLoading) return <SidebarSkeleton />;

    return (
      <aside className="hidden lg:block w-72 bg-white/70 backdrop-blur-sm border-r border-gray-200 p-5 min-h-[calc(100vh-65px)] sticky top-[65px]">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder={sidebarSearchPlaceholder}
            className="w-full px-4 py-2.5 pl-10 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all text-sm text-gray-900 placeholder-gray-400"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {!!error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
            <span className="pr-2">{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700 font-bold"
              aria-label="Clear error"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            {sidebarTitle}
          </h3>

          {sidebarItems.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
              {hasFilteredWorkspaces
                ? "No projects yet. Create your first project."
                : "No workspaces yet. Create your first workspace."}
            </div>
          ) : (
            <div className="space-y-1">
              {sidebarItems.map((name, idx) => (
                <div
                  key={`${name}-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 transition-all cursor-pointer group border border-gray-100 hover:border-blue-200"
                >
                  <div
                    className={classNames(
                      "w-2 h-2 rounded-full",
                      idx === 0
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/40"
                        : "bg-gray-400"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={openCreateTenant}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all group"
              type="button"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                Create Organization
              </span>
            </button>

            {!hasFilteredWorkspaces ? (
              <button
                onClick={openCreateWorkspace}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-all group"
                type="button"
              >
                <Plus className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                  Create Workspace
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={openCreateProject}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100 transition-all group"
                  type="button"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                    New Project
                  </span>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all group"
                  type="button"
                >
                  <Github className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                    Import from GitHub
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    );
  };

  // Checklist (keep here)
  const renderChecklist = () => {
    if (selectionState === "project-selected") return null;
    if (isLoading) return <ChecklistSkeleton />;

    return (
      <div className="bg-white rounded-2xl p-5 md:p-6 mb-6 md:mb-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Getting Started
            </h2>
            <p className="text-sm text-gray-500">
              Complete these steps to unlock all features
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              0 / 5 completed
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-0 transition-all duration-500 rounded-full"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {checklistItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.done
                    ? "bg-emerald-100 text-emerald-500"
                    : "bg-gray-200 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500"
                    } transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const tenantLabel =
    tenantType === "BUSINESS"
      ? "What's your organisation name?"
      : "What's your project name?";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-50/50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      {isLoading ? <HeaderSkeleton /> : <Header />}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row relative">
        {renderSidebar()}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <ExploreMainSection
            isLoading={isLoading}
            selectionState={selectionState}
            selectedOrg={selectedOrg}
            selectedWorkspace={selectedWorkspace}
            selectedProject={selectedProject}
            selectedWorkspaceId={selectedWorkspaceId}
            selectedProjectId={selectedProjectId}
            filteredWorkspaces={filteredWorkspaces}
            filteredProjects={filteredProjects}
            projects={projects}
            onSelectWorkspace={selectWorkspace}
            onSelectProject={selectProject}
            onOpenCreateWorkspace={openCreateWorkspace}
            onOpenCreateProject={openCreateProject}
            projectDetails={selectedProjectDetails}
            isLoadingDetails={isLoadingProjectDetails}
          />

          {renderChecklist()}
        </main>
      </div>

      <ExploreCreateModals
        // workspace
        workspaceModalOpen={workspaceModalOpen}
        setWorkspaceModalOpen={setWorkspaceModalOpen}
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        creatingWorkspace={creatingWorkspace}
        onSubmitCreateWorkspace={submitCreateWorkspace}
        // project
        projectModalOpen={projectModalOpen}
        setProjectModalOpen={setProjectModalOpen}
        projectName={projectName}
        setProjectName={setProjectName}
        projectType={projectType}
        setProjectType={setProjectType}
        creatingProject={creatingProject}
        onSubmitCreateProject={submitCreateProject}
        selectedWorkspaceId={selectedWorkspaceId}
        onSelectWorkspace={selectWorkspace}
        filteredWorkspaces={filteredWorkspaces}
        // tenant
        tenantModalOpen={tenantModalOpen}
        setTenantModalOpen={setTenantModalOpen}
        tenantName={tenantName}
        setTenantName={setTenantName}
        tenantType={tenantType}
        setTenantType={setTenantType}
        creatingTenant={creatingTenant}
        onSubmitCreateTenant={submitCreateTenant}
        tenantLabel={tenantLabel}
      />
    </div>
  );
}