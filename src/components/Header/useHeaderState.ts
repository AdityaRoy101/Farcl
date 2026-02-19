import { useState } from "react";
import type { ProjectType, OrgType } from "../../contexts/workspace";

export function useHeaderState() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWorkspacesDropdown, setShowWorkspacesDropdown] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [showOrgsDropdown, setShowOrgsDropdown] = useState(false);

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

  const [avatarError, setAvatarError] = useState(false);

  const closeAllDropdowns = () => {
    setShowProfileDropdown(false);
    setShowWorkspacesDropdown(false);
    setShowProjectsDropdown(false);
    setShowOrgsDropdown(false);
  };

  return {
    // Dropdowns
    showProfileDropdown,
    setShowProfileDropdown,
    showMobileMenu,
    setShowMobileMenu,
    showWorkspacesDropdown,
    setShowWorkspacesDropdown,
    showProjectsDropdown,
    setShowProjectsDropdown,
    showOrgsDropdown,
    setShowOrgsDropdown,
    closeAllDropdowns,

    // Workspace modal
    workspaceModalOpen,
    setWorkspaceModalOpen,
    workspaceName,
    setWorkspaceName,
    creatingWorkspace,
    setCreatingWorkspace,

    // Project modal
    projectModalOpen,
    setProjectModalOpen,
    projectName,
    setProjectName,
    projectType,
    setProjectType,
    creatingProject,
    setCreatingProject,

    // Tenant modal
    tenantModalOpen,
    setTenantModalOpen,
    tenantName,
    setTenantName,
    tenantType,
    setTenantType,
    creatingTenant,
    setCreatingTenant,

    // Other
    avatarError,
    setAvatarError,
  };
}
