// src/components/Header/Header.tsx
import { useNavigate } from "react-router-dom";
import { Bell, Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth";
import { useOrg, useWorkspace, useProject } from "../../contexts/workspace";
import { Sidebar } from "../Sidebar/Sidebar";
import { ExploreCreateModals } from "../../modules/explore/ExploreCreateModals";
import { ChatWidget } from "../chatbot/ChatWidget";
import { useHeaderState } from "./useHeaderState";
import { HeaderNavDesktop } from "./HeaderNavDesktop";
import { HeaderNavMobile } from "./HeaderNavMobile";
import { HeaderSearch } from "./HeaderSearch";
import { ProfileMenu } from "./ProfileMenu";

// Dark Mode Toggle Component
function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("farcl_studio_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("farcl_studio_dark_mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2.5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white transition-colors text-gray-600 hover:text-gray-900 shadow-sm border border-white/50"
      title={isDarkMode ? "Light Mode" : "Dark Mode"}
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export function Header() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    // After OAuth redirects, store may not be initialized yet.
    // This makes Header self-healing on every route.
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);



  // Use separate context hooks
  const {
    selectOrg,
    createTenant,
  } = useOrg();

  const {
    filteredWorkspaces,
    selectedWorkspaceId,
    selectedWorkspace,
    selectWorkspace,
    createWorkspace,
  } = useWorkspace();

  const {
    createProject,
    selectProject,
  } = useProject();

  // Use the custom hook for state management
  const {
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
    workspaceModalOpen,
    setWorkspaceModalOpen,
    workspaceName,
    setWorkspaceName,
    creatingWorkspace,
    setCreatingWorkspace,
    projectModalOpen,
    setProjectModalOpen,
    projectName,
    setProjectName,
    projectType,
    setProjectType,
    creatingProject,
    setCreatingProject,
    tenantModalOpen,
    setTenantModalOpen,
    tenantName,
    setTenantName,
    tenantType,
    setTenantType,
    creatingTenant,
    setCreatingTenant,
  } = useHeaderState();

  // Note: hasWorkspace and handleLogout are prepared for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasWorkspace = filteredWorkspaces.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };



  // Open modal handlers
  const openCreateWorkspace = () => {
    setWorkspaceName("");
    setWorkspaceModalOpen(true);
    setShowWorkspacesDropdown(false);
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
    setProjectType("MONOREPO");
    setProjectModalOpen(true);
    setShowProjectsDropdown(false);
  };

  const openCreateTenant = () => {
    setTenantName("");
    setTenantType("PERSONAL");
    setTenantModalOpen(true);
    setShowOrgsDropdown(false);
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

    // Frontend guards
    if (!selectedWorkspace?.id) {
      throw new Error("No workspace selected");
    }
    if (selectedWorkspace.id.length < 10) {
      throw new Error("Invalid workspace id");
    }

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

  const tenantLabel =
    tenantType === "BUSINESS"
      ? "What's your organisation name?"
      : "What's your project name?";

  return (
    <header
      className="border-b border-cyan-200/50 sticky top-0 z-50"
      style={{
        background: `linear-gradient(
          to right,
          rgb(255, 255, 255) 0%,
          rgb(255, 255, 255) 5%,
          rgb(221 231 232) 10%,
          rgb(212 232 248) 15%,
          rgb(224, 247, 250) 25%,
          rgb(255, 255, 255) 35%,
          rgb(255, 255, 255) 100%
        )`,
      }}
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        {/* Left */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setShowMobileMenu((v) => !v)}
            className="lg:hidden p-2 rounded-xl bg-white/70 hover:bg-white transition-colors text-gray-700 hover:text-gray-900 shadow-sm backdrop-blur-sm"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Sidebar />
        </div>

        <HeaderNavDesktop
          showOrgsDropdown={showOrgsDropdown}
          setShowOrgsDropdown={setShowOrgsDropdown}
          showWorkspacesDropdown={showWorkspacesDropdown}
          setShowWorkspacesDropdown={setShowWorkspacesDropdown}
          showProjectsDropdown={showProjectsDropdown}
          setShowProjectsDropdown={setShowProjectsDropdown}
          closeAllDropdowns={closeAllDropdowns}
          onCreateTenant={openCreateTenant}
          onCreateWorkspace={openCreateWorkspace}
          onCreateProject={openCreateProject}
        />

        {/* Right */}
        <div className="flex items-center gap-3 md:gap-4">
          <DarkModeToggle />
          <HeaderSearch className="hidden sm:block" />

          <button className="relative p-2.5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white transition-colors text-gray-600 hover:text-gray-900 shadow-sm border border-white/50" title="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <ProfileMenu
            showProfileDropdown={showProfileDropdown}
            setShowProfileDropdown={setShowProfileDropdown}
            closeAllDropdowns={closeAllDropdowns}
          />
        </div>
      </div>

      <HeaderNavMobile
        showMobileMenu={showMobileMenu}
        showOrgsDropdown={showOrgsDropdown}
        setShowOrgsDropdown={setShowOrgsDropdown}
        showWorkspacesDropdown={showWorkspacesDropdown}
        setShowWorkspacesDropdown={setShowWorkspacesDropdown}
        showProjectsDropdown={showProjectsDropdown}
        setShowProjectsDropdown={setShowProjectsDropdown}
        onSelectOrg={selectOrg}
        onSelectWorkspace={selectWorkspace}
        onSelectProject={selectProject}
      />

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
      <ChatWidget />
    </header>
  );
}