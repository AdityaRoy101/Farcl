import { Database, ChevronsUpDown, CheckCircle2, Plus } from "lucide-react";
import { useWorkspace, useProject } from "../../contexts/workspace";
import type { Workspace, Project } from "../../contexts/workspace";

interface WorkspaceSwitcherProps {
  showWorkspacesDropdown: boolean;
  setShowWorkspacesDropdown: (show: boolean) => void;
  closeAllDropdowns: () => void;
  onCreateWorkspace: () => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function WorkspaceSwitcher({
  showWorkspacesDropdown,
  setShowWorkspacesDropdown,
  closeAllDropdowns,
  onCreateWorkspace,
}: WorkspaceSwitcherProps) {
  const {
    filteredWorkspaces,
    selectedWorkspaceId,
    selectedWorkspace,
    selectWorkspace,
  } = useWorkspace();

  const { projects } = useProject();

  return (
    <div className="relative">
      <button
        onClick={() => {
          closeAllDropdowns();
          setShowWorkspacesDropdown(!showWorkspacesDropdown);
        }}
        className="flex items-center gap-1.5 px-3 py-2 font-medium rounded-lg transition-all duration-200 text-gray-800 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm"
      >
        {selectedWorkspace ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Database className="w-3 h-3 text-white" />
            </div>
            <span className="max-w-[160px] truncate font-semibold">{selectedWorkspace.name}</span>
          </div>
        ) : (
          <span className="font-semibold">Workspaces</span>
        )}
        <ChevronsUpDown
          className={classNames(
            "w-3.5 h-3.5 text-gray-600 transition-transform",
            showWorkspacesDropdown && "rotate-180"
          )}
        />
      </button>

      {showWorkspacesDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowWorkspacesDropdown(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Switch Workspace
              </div>
              {filteredWorkspaces.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No workspaces yet</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {filteredWorkspaces.map((workspace: Workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        selectWorkspace(workspace.id);
                        setShowWorkspacesDropdown(false);
                      }}
                      className={classNames(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        selectedWorkspaceId === workspace.id ? "bg-blue-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className={classNames(
                            "font-medium transition-colors text-sm",
                            selectedWorkspaceId === workspace.id
                              ? "text-blue-600"
                              : "text-gray-900 group-hover:text-blue-600"
                          )}
                        >
                          {workspace.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {projects.filter((p: Project) => p.workspaceId === workspace.id).length} projects
                        </div>
                      </div>
                      {selectedWorkspaceId === workspace.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2 border-t border-gray-100 mt-1">
                <button
                  onClick={onCreateWorkspace}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
