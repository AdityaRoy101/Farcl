// src/modules/explore/components/ExploreMainSection.tsx

//import type { ComponentType } from "react";
import {
  Plus,
  ArrowRight,
  Rocket,
  Database,
  Folder,
  ChevronRight,
  GitBranch,
  ExternalLink,
  Monitor,
  Server,
  Layers,
} from "lucide-react";
import type { Project, ProjectDetails, Tenant, Workspace } from "../../contexts/workspace";
import { WelcomeSkeleton } from "../../components/Skeleton";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export type ExploreSelectionState =
  | "no-org"
  | "no-workspaces"
  | "select-workspace"
  | "no-projects"
  | "select-project"
  | "project-selected";

export function ExploreMainSection(props: {
  isLoading: boolean;
  selectionState: ExploreSelectionState;

  selectedOrg: Tenant | undefined;
  selectedWorkspace: Workspace | undefined;
  selectedProject: Project | undefined;

  selectedWorkspaceId: string;
  selectedProjectId: string;

  filteredWorkspaces: Workspace[];
  filteredProjects: Project[];
  projects: Project[];

  onSelectWorkspace: (workspaceId: string) => void;
  onSelectProject: (projectId: string) => void;

  onOpenCreateWorkspace: () => void;
  onOpenCreateProject: () => void;

  // Project details
  projectDetails: ProjectDetails | null;
  isLoadingDetails: boolean;
}) {
  const {
    isLoading,
    selectionState,
    selectedOrg,
    selectedWorkspace,
    selectedProject,
    selectedWorkspaceId,
    selectedProjectId,
    filteredWorkspaces,
    filteredProjects,
    projects,
    onSelectWorkspace,
    onSelectProject,
    onOpenCreateWorkspace,
    onOpenCreateProject,
    projectDetails,
    isLoadingDetails,
  } = props;

  if (isLoading) return <WelcomeSkeleton />;

  const renderWelcomeNoWorkspaces = () => {
    return (
      <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50" />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Welcome to,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Farcl
              </span>
              !
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 max-w-xl">
              Get started by creating your first workspace. Workspaces help you
              organize your projects.
            </p>

            <button
              onClick={onOpenCreateWorkspace}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-200"
              type="button"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4 text-xs text-gray-400">
              {selectedOrg ? `Organization: ${selectedOrg.name}` : ""}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-6 hover:rotate-12 transition-transform duration-500">
                <Rocket className="w-16 h-16 text-white -rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkspaceSelection = () => {
    return (
      <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50" />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Select a Workspace
              </h2>
              <p className="text-sm text-gray-500">
                Choose a workspace to continue in {selectedOrg?.name}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWorkspaces.map((workspace) => {
              const projectCount = projects.filter(
                (p) => p.workspaceId === workspace.id
              ).length;

              return (
                <button
                  key={workspace.id}
                  onClick={() => onSelectWorkspace(workspace.id)}
                  className={classNames(
                    "group flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    selectedWorkspaceId === workspace.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  )}
                  type="button"
                >
                  <div
                    className={classNames(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      selectedWorkspaceId === workspace.id
                        ? "bg-emerald-500"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700"
                    )}
                  >
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {workspace.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {projectCount} {projectCount === 1 ? "project" : "projects"}
                    </div>
                  </div>
                  <ChevronRight
                    className={classNames(
                      "w-5 h-5 transition-transform",
                      selectedWorkspaceId === workspace.id
                        ? "text-emerald-500"
                        : "text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1"
                    )}
                  />
                </button>
              );
            })}

            <button
              onClick={onOpenCreateWorkspace}
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left"
              type="button"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700 group-hover:text-emerald-700">
                  Create Workspace
                </div>
                <div className="text-sm text-gray-500">Add a new workspace</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNoProjects = () => {
    return (
      <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-violet-50/50" />

        <div className="relative text-center py-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <span className="text-gray-900 font-medium">{selectedOrg?.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-600 font-medium">
              {selectedWorkspace?.name}
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Folder className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            No Projects Yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            This workspace doesn't have any projects. Create your first project
            to get started.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenCreateProject}
              className="group flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
              type="button"
            >
              <Plus className="w-5 h-5" />
              Create Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectWorkspace("")}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-200 transition-all"
              type="button"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Workspaces
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectSelection = () => {
    return (
      <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-violet-50/50" />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-violet-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="text-gray-900 font-medium">{selectedOrg?.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-emerald-600 font-medium">
              {selectedWorkspace?.name}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span>Select Project</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Select a Project
              </h2>
              <p className="text-sm text-gray-500">
                Choose a project in {selectedWorkspace?.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectWorkspace("")}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            type="button"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            Back to workspaces
          </button>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={classNames(
                  "group flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  selectedProjectId === project.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
                )}
                type="button"
              >
                <div
                  className={classNames(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    selectedProjectId === project.id
                      ? "bg-violet-500"
                      : "bg-gradient-to-br from-violet-500 to-violet-600 group-hover:from-violet-600 group-hover:to-violet-700"
                  )}
                >
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedWorkspace?.name}
                  </div>
                </div>
                <ChevronRight
                  className={classNames(
                    "w-5 h-5 transition-transform",
                    selectedProjectId === project.id
                      ? "text-violet-500"
                      : "text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1"
                  )}
                />
              </button>
            ))}

            <button
              onClick={onOpenCreateProject}
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-violet-400 hover:bg-violet-50/50 transition-all text-left"
              type="button"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-gray-500 group-hover:text-violet-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700 group-hover:text-violet-700">
                  Create Project
                </div>
                <div className="text-sm text-gray-500">Add a new project</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectDetails = () => {
    const PROJECT_TYPE_ICONS = {
      FRONTEND: Monitor,
      BACKEND: Server,
      MONOREPO: Layers,
    };

    const PROJECT_TYPE_COLORS = {
      FRONTEND: "bg-blue-100 text-blue-700 border-blue-200",
      BACKEND: "bg-indigo-100 text-indigo-700 border-indigo-200",
      MONOREPO: "bg-orange-100 text-orange-700 border-orange-200",
    };

    const TypeIcon = projectDetails?.projectType
      ? PROJECT_TYPE_ICONS[projectDetails.projectType]
      : Folder;

    return (
      <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+")',
          }}
        />
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {projectDetails?.name || selectedProject?.name}
              </h1>

              {isLoadingDetails ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              ) : projectDetails ? (
                <div className="space-y-4">
                  {/* Project Type Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={classNames(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border",
                        PROJECT_TYPE_COLORS[projectDetails.projectType]
                      )}
                    >
                      <TypeIcon className="w-4 h-4" />
                      {projectDetails.projectType}
                    </span>

                    {projectDetails.defaultBranch && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                        <GitBranch className="w-3.5 h-3.5" />
                        {projectDetails.defaultBranch}
                      </span>
                    )}
                  </div>

                  {/* Repo Link */}
                  {projectDetails.repoLink && (
                    <a
                      href={projectDetails.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {projectDetails.repoLink}
                    </a>
                  )}

                  {/* Workspace Badge */}
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <Database className="w-3 h-3" />
                    {selectedWorkspace?.name}
                  </span>
                </div>
              ) : (
                <p className="text-base md:text-lg text-gray-500 mb-4">
                  Project details not available.
                </p>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative w-28 h-28 bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 rotate-6 hover:rotate-12 transition-transform duration-500">
                  <TypeIcon className="w-14 h-14 text-white -rotate-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (selectionState) {
    case "no-workspaces":
      return renderWelcomeNoWorkspaces();
    case "select-workspace":
      return renderWorkspaceSelection();
    case "no-projects":
      return renderNoProjects();
    case "select-project":
      return renderProjectSelection();
    case "project-selected":
      return renderProjectDetails();
    // includes "no-org"
    default:
      return renderWelcomeNoWorkspaces();
  }
}