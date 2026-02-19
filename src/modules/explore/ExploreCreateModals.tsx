// src/modules/explore/components/ExploreCreateModals.tsx

import { type ReactNode } from "react";
import { X } from "lucide-react";
import type { OrgType, ProjectType, Workspace } from "../../contexts/workspace";

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  STUDENT: "Student",
  PERSONAL: "Personal",
  BUSINESS: "Business",
};

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  MONOREPO: "Monorepo",
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ExploreCreateModals(props: {
  // workspace
  workspaceModalOpen: boolean;
  setWorkspaceModalOpen: (open: boolean) => void;
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  creatingWorkspace: boolean;
  onSubmitCreateWorkspace: () => Promise<void>;

  // project
  projectModalOpen: boolean;
  setProjectModalOpen: (open: boolean) => void;
  projectName: string;
  setProjectName: (v: string) => void;
  projectType: ProjectType;
  setProjectType: (v: ProjectType) => void;
  creatingProject: boolean;
  onSubmitCreateProject: () => Promise<void>;
  selectedWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  filteredWorkspaces: Workspace[];

  // tenant
  tenantModalOpen: boolean;
  setTenantModalOpen: (open: boolean) => void;
  tenantName: string;
  setTenantName: (v: string) => void;
  tenantType: OrgType;
  setTenantType: (v: OrgType) => void;
  creatingTenant: boolean;
  onSubmitCreateTenant: () => Promise<void>;
  tenantLabel: string;
}) {
  const {
    workspaceModalOpen,
    setWorkspaceModalOpen,
    workspaceName,
    setWorkspaceName,
    creatingWorkspace,
    onSubmitCreateWorkspace,

    projectModalOpen,
    setProjectModalOpen,
    projectName,
    setProjectName,
    projectType,
    setProjectType,
    creatingProject,
    onSubmitCreateProject,
    selectedWorkspaceId,
    onSelectWorkspace,
    filteredWorkspaces,

    tenantModalOpen,
    setTenantModalOpen,
    tenantName,
    setTenantName,
    tenantType,
    setTenantType,
    creatingTenant,
    onSubmitCreateTenant,
    tenantLabel,
  } = props;

  return (
    <>
      {/* Create Workspace */}
      <Modal
        open={workspaceModalOpen}
        title="Create a workspace"
        onClose={() => !creatingWorkspace && setWorkspaceModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Ex: Team Workspace"
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={creatingWorkspace}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWorkspaceModalOpen(false)}
              disabled={creatingWorkspace}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitCreateWorkspace}
              disabled={creatingWorkspace || !workspaceName.trim()}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creatingWorkspace ? "Creating..." : "Submit"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Project */}
      <Modal
        open={projectModalOpen}
        title="Create a project"
        onClose={() => !creatingProject && setProjectModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Workspace
            </label>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => onSelectWorkspace(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={creatingProject}
            >
              {filteredWorkspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Project name
            </label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: My App"
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={creatingProject}
            />
          </div>

          {/* Project Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What type of project is this?
            </label>
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 gap-1">
              {(["FRONTEND", "BACKEND", "MONOREPO"] as ProjectType[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setProjectType(opt)}
                  disabled={creatingProject}
                  className={classNames(
                    "px-4 py-1.5 text-sm rounded-full transition-all duration-200",
                    projectType === opt
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm",
                    creatingProject ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {PROJECT_TYPE_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProjectModalOpen(false)}
              disabled={creatingProject}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitCreateProject}
              disabled={creatingProject || !projectName.trim() || !selectedWorkspaceId}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creatingProject ? "Creating..." : "Submit"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Organization */}
      <Modal
        open={tenantModalOpen}
        title="Create an organization"
        onClose={() => !creatingTenant && setTenantModalOpen(false)}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What's your organisation type?
            </label>

            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 gap-1">
              {(["STUDENT", "PERSONAL", "BUSINESS"] as OrgType[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTenantType(opt)}
                  disabled={creatingTenant}
                  className={classNames(
                    "px-4 py-1.5 text-sm rounded-full transition-all duration-200",
                    tenantType === opt
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm",
                    creatingTenant ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {ORG_TYPE_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {tenantLabel}
            </label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder={tenantType === "BUSINESS" ? "Ex: Acme Inc" : "Ex: My Cool Project"}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
              disabled={creatingTenant}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTenantModalOpen(false)}
              disabled={creatingTenant}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmitCreateTenant}
              disabled={creatingTenant || !tenantName.trim()}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {creatingTenant ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Create Organization"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}