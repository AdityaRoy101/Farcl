/*import { OrgSwitcherMobile } from "./OrgSwitcherMobile";
import { WorkspaceSwitcherMobile } from "./WorkspaceSwitcherMobile";
import { ProjectSwitcherMobile } from "./ProjectSwitcherMobile";*/
import { useOrg } from "../../contexts/workspace";
import { useWorkspace } from "../../contexts/workspace";
import { useProject } from "../../contexts/workspace";
import type { Tenant, Workspace, Project } from "../../contexts/workspace";
import { Building2, ChevronDown, CheckCircle2, Database, Folder } from "lucide-react";

interface HeaderNavMobileProps {
  showMobileMenu: boolean;
  showOrgsDropdown: boolean;
  setShowOrgsDropdown: (show: boolean) => void;
  showWorkspacesDropdown: boolean;
  setShowWorkspacesDropdown: (show: boolean) => void;
  showProjectsDropdown: boolean;
  setShowProjectsDropdown: (show: boolean) => void;
  onSelectOrg: (orgId: string) => Promise<void>;
  onSelectWorkspace: (workspaceId: string) => void;
  onSelectProject: (projectId: string) => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function HeaderNavMobile({
  showMobileMenu,
  showOrgsDropdown,
  setShowOrgsDropdown,
  showWorkspacesDropdown,
  setShowWorkspacesDropdown,
  showProjectsDropdown,
  setShowProjectsDropdown,
  onSelectOrg,
  onSelectWorkspace,
  onSelectProject,
}: HeaderNavMobileProps) {
  const { tenants, selectedOrg, selectedOrgId, isSwitchingTenant } = useOrg();
  const { filteredWorkspaces, selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const { filteredProjects, selectedProject, selectedProjectId } = useProject();

  if (!showMobileMenu) return null;

  return (
    <div className="lg:hidden border-t border-cyan-200/50 bg-white/90 backdrop-blur-sm">
      <div className="p-4 space-y-2">
        <div className="relative sm:hidden mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-gray-900 placeholder-gray-400"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Mobile Orgs */}
        <div className="space-y-1">
          <button
            onClick={() => setShowOrgsDropdown(!showOrgsDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-cyan-50 transition-all"
          >
            <div className="flex items-center gap-2">
              {selectedOrg && (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-white" />
                </div>
              )}
              <span>{selectedOrg?.name || "Organizations"}</span>
            </div>
            <ChevronDown className={classNames("w-4 h-4 transition-transform", showOrgsDropdown && "rotate-180")} />
          </button>

          {showOrgsDropdown && (
            <div className="ml-4 space-y-1">
              {tenants.map((tenant: Tenant) => (
                <button
                  key={tenant.id}
                  disabled={isSwitchingTenant}
                  onClick={async () => {
                    await onSelectOrg(tenant.id);
                    setShowOrgsDropdown(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
                    selectedOrgId === tenant.id
                      ? "bg-cyan-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    isSwitchingTenant && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{tenant.name}</span>
                  {selectedOrgId === tenant.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Workspaces */}
        <div className="space-y-1">
          <button
            onClick={() => setShowWorkspacesDropdown(!showWorkspacesDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-cyan-50 transition-all"
          >
            <div className="flex items-center gap-2">
              {selectedWorkspace && (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Database className="w-3 h-3 text-white" />
                </div>
              )}
              <span>{selectedWorkspace?.name || "Workspaces"}</span>
            </div>
            <ChevronDown
              className={classNames("w-4 h-4 transition-transform", showWorkspacesDropdown && "rotate-180")}
            />
          </button>

          {showWorkspacesDropdown && (
            <div className="ml-4 space-y-1">
              {filteredWorkspaces.map((workspace: Workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    onSelectWorkspace(workspace.id);
                    setShowWorkspacesDropdown(false);
                  }}
                  className={classNames(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
                    selectedWorkspaceId === workspace.id
                      ? "bg-cyan-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm">{workspace.name}</span>
                  {selectedWorkspaceId === workspace.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Projects */}
        <div className="space-y-1">
          <button
            onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-cyan-50 transition-all"
          >
            <div className="flex items-center gap-2">
              {selectedProject && (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                  <Folder className="w-3 h-3 text-white" />
                </div>
              )}
              <span>{selectedProject?.name || "Projects"}</span>
            </div>
            <ChevronDown
              className={classNames("w-4 h-4 transition-transform", showProjectsDropdown && "rotate-180")}
            />
          </button>

          {showProjectsDropdown && (
            <div className="ml-4 space-y-1">
              {selectedWorkspaceId ? (
                filteredProjects.map((project: Project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onSelectProject(project.id);
                      setShowProjectsDropdown(false);
                    }}
                    className={classNames(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
                      selectedProjectId === project.id
                        ? "bg-cyan-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="text-sm">{project.name}</span>
                    {selectedProjectId === project.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">Select a workspace first</div>
              )}

              {!filteredWorkspaces.length && <div className="px-4 py-2 text-sm text-gray-500">No workspaces yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
