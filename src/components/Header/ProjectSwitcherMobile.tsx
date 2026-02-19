import { ChevronDown, Folder, CheckCircle2 } from "lucide-react";
import { useWorkspace, useProject } from "../../contexts/workspace";
import type { Project } from "../../contexts/workspace";

interface ProjectSwitcherMobileProps {
  showProjectsDropdown: boolean;
  setShowProjectsDropdown: (show: boolean) => void;
  onSelectProject: (projectId: string) => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function ProjectSwitcherMobile({
  showProjectsDropdown,
  setShowProjectsDropdown,
  onSelectProject,
}: ProjectSwitcherMobileProps) {
  const {
    filteredProjects,
    selectedProjectId,
    selectedProject,
  } = useProject();

  const {
    selectedWorkspaceId,
    filteredWorkspaces,
  } = useWorkspace();

  return (
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
  );
}
