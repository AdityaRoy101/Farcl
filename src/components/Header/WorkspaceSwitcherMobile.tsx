import { ChevronDown, Database, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../contexts/workspace";
import type { Workspace } from "../../contexts/workspace";

interface WorkspaceSwitcherMobileProps {
  showWorkspacesDropdown: boolean;
  setShowWorkspacesDropdown: (show: boolean) => void;
  onSelectWorkspace: (workspaceId: string) => void;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function WorkspaceSwitcherMobile({
  showWorkspacesDropdown,
  setShowWorkspacesDropdown,
  onSelectWorkspace,
}: WorkspaceSwitcherMobileProps) {
  const {
    filteredWorkspaces,
    selectedWorkspaceId,
    selectedWorkspace,
  } = useWorkspace();

  return (
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
  );
}
