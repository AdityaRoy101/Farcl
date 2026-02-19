import { Folder, ChevronsUpDown, CheckCircle2, Plus } from "lucide-react";
import { useWorkspace, useProject } from "../../contexts/workspace";
import type { Project } from "../../contexts/workspace";

interface ProjectSwitcherProps {
  showProjectsDropdown: boolean;
  setShowProjectsDropdown: (show: boolean) => void;
  closeAllDropdowns: () => void;
  onCreateProject: () => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function ProjectSwitcher({
  showProjectsDropdown,
  setShowProjectsDropdown,
  closeAllDropdowns,
  onCreateProject,
}: ProjectSwitcherProps) {
  const {
    filteredProjects,
    selectedProjectId,
    selectedProject,
    selectProject,
  } = useProject();

  const {
    selectedWorkspace,
    selectedWorkspaceId,
  } = useWorkspace();

  const getWorkspaceName = () => {
    // This would need to be passed from parent or accessed differently
    // For now, we'll use selectedWorkspace
    return selectedWorkspace?.name || "Unknown Workspace";
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          closeAllDropdowns();
          setShowProjectsDropdown(!showProjectsDropdown);
        }}
        className="flex items-center gap-1.5 px-3 py-2 font-medium rounded-lg transition-all duration-200 text-gray-800 hover:text-gray-900 hover:bg-white/50 backdrop-blur-sm"
      >
        {selectedProject ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Folder className="w-3 h-3 text-white" />
            </div>
            <span className="max-w-[160px] truncate font-semibold">{selectedProject.name}</span>
          </div>
        ) : (
          <span className="font-semibold">Projects</span>
        )}
        <ChevronsUpDown
          className={classNames(
            "w-3.5 h-3.5 text-gray-600 transition-transform",
            showProjectsDropdown && "rotate-180"
          )}
        />
      </button>

      {showProjectsDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowProjectsDropdown(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {selectedWorkspace ? `Projects in ${selectedWorkspace.name}` : "Select a Workspace First"}
              </div>
              {!selectedWorkspaceId ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  Please select a workspace first
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No projects in this workspace</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {filteredProjects.map((project: Project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        selectProject(project.id);
                        setShowProjectsDropdown(false);
                      }}
                      className={classNames(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        selectedProjectId === project.id ? "bg-blue-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
                        <Folder className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className={classNames(
                            "font-medium transition-colors text-sm",
                            selectedProjectId === project.id
                              ? "text-blue-600"
                              : "text-gray-900 group-hover:text-blue-600"
                          )}
                        >
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {getWorkspaceName()}
                        </div>
                      </div>
                      {selectedProjectId === project.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2 border-t border-gray-100 mt-1">
                <button
                  onClick={onCreateProject}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
