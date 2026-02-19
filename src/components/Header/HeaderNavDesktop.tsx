import { OrgSwitcher } from "./OrgSwitcher";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { ProjectSwitcher } from "./ProjectSwitcher";

interface HeaderNavDesktopProps {
  showOrgsDropdown: boolean;
  setShowOrgsDropdown: (show: boolean) => void;
  showWorkspacesDropdown: boolean;
  setShowWorkspacesDropdown: (show: boolean) => void;
  showProjectsDropdown: boolean;
  setShowProjectsDropdown: (show: boolean) => void;
  closeAllDropdowns: () => void;
  onCreateTenant: () => void;
  onCreateWorkspace: () => void;
  onCreateProject: () => void;
}

export function HeaderNavDesktop({
  showOrgsDropdown,
  setShowOrgsDropdown,
  showWorkspacesDropdown,
  setShowWorkspacesDropdown,
  showProjectsDropdown,
  setShowProjectsDropdown,
  closeAllDropdowns,
  onCreateTenant,
  onCreateWorkspace,
  onCreateProject,
}: HeaderNavDesktopProps) {
  return (
    <nav className="hidden lg:flex items-center gap-1 absolute left-[288px]">
      <OrgSwitcher
        showOrgsDropdown={showOrgsDropdown}
        setShowOrgsDropdown={setShowOrgsDropdown}
        closeAllDropdowns={closeAllDropdowns}
        onCreateTenant={onCreateTenant}
      />

      <span className="text-gray-500 mx-1 font-light">/</span>

      <WorkspaceSwitcher
        showWorkspacesDropdown={showWorkspacesDropdown}
        setShowWorkspacesDropdown={setShowWorkspacesDropdown}
        closeAllDropdowns={closeAllDropdowns}
        onCreateWorkspace={onCreateWorkspace}
      />

      <span className="text-gray-500 mx-1 font-light">/</span>

      <ProjectSwitcher
        showProjectsDropdown={showProjectsDropdown}
        setShowProjectsDropdown={setShowProjectsDropdown}
        closeAllDropdowns={closeAllDropdowns}
        onCreateProject={onCreateProject}
      />
    </nav>
  );
}
