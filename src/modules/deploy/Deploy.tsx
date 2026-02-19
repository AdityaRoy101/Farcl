import { useState, useMemo, type ReactNode, useEffect, useRef } from "react";
import { ArrowRight, Github, Gitlab, Plus, X, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";

import globalConfig from "../../lib/globalConfig";
import { Header } from "../../components/Header/Header";
import { DeployPageSkeleton } from "../../components/Skeleton";
import { useOrg, useProject, useWorkspace } from "../../contexts/workspace";
import { DeploySidebar, type DeployTab } from "./DeploySidebar";
import { RepoImportPanel } from "./RepoImportPanel";
import {
  IS_GITHUB_CONNECTED_MUTATION,
  ADD_GITHUB_PROVIDER_MUTATION,
} from "../../lib/graphql/mutations/Deploy/GithubConnect";
import { useNavigate } from "react-router-dom";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

function getGqlErrors(json: any): Array<{ message?: string }> {
  return json?.body?.singleResult?.errors ?? json?.errors ?? [];
}

function getGqlData(json: any): any {
  return json?.body?.singleResult?.data ?? json?.data ?? null;
}

function responsiveSizes(sizes: readonly string[]) {
  const prefixes = ["", "md:", "lg:", "xl:", "2xl:"];
  return sizes.map((s, i) => `${prefixes[i] ?? ""}${s}`).join(" ");
}

const typo = globalConfig.typography;

const H2 = cx(
  responsiveSizes(typo.headings.h2.sizes),
  typo.headings.h2.weight,
  typo.headings.h2.color
);

const P_SMALL = cx(
  typo.paragraph.small.size,
  typo.paragraph.small.weight,
  typo.paragraph.small.color
);

function Modal(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const { open, title, subtitle, children, onClose } = props;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h3
                className={cx(
                  typo.headings.h3.sizes[0],
                  typo.headings.h3.weight,
                  typo.headings.h3.color
                )}
              >
                {title}
              </h3>
              {subtitle ? <p className={cx("mt-1", P_SMALL)}>{subtitle}</p> : null}
            </div>
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
function RepoSectionSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-14 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-14 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function Deploy() {
  const navigate = useNavigate();

  const [freezeUI, setFreezeUI] = useState(false);

  const {
  isLoading: orgLoading,
  error: orgError,
  clearError,
  selectedOrg,
  } = useOrg();

  // NOTE: We also try to read a createWorkspace function if it exists in your workspace context.
  // This keeps the page compiling even if createWorkspace isn't implemented yet.
  const wsAny = useWorkspace() as any;
  const { filteredWorkspaces, selectedWorkspaceId, selectedWorkspace } = wsAny as {
    filteredWorkspaces: Array<{ id: string; name: string }>;
    selectedWorkspaceId: string | null;
    selectedWorkspace?: { id: string; name: string } | null;
  };
  const createWorkspace: undefined | ((name: string) => Promise<any>) = wsAny?.createWorkspace;

  const { selectedProjectId, createProject, selectedProjectDetails } = useProject();

  const tabs = useMemo(
    () =>
      [
        { id: "overview", label: "Overview" },
        { id: "integrations", label: "Integrations" },
        { id: "deployments", label: "Deployments" },
        { id: "activity", label: "Activity" },
        { id: "domains", label: "Domains" },
        { id: "usage", label: "Usage" },
        { id: "observability", label: "Observability" },
        { id: "storage", label: "Storage" },
        { id: "flags", label: "Flags" },
        { id: "ai-gateway", label: "AI Gateway" },
        { id: "agent", label: "Agent" },
        { id: "support", label: "Support" },
        { id: "settings", label: "Settings" },
      ] as const,
    []
  );

  const [activeTab, setActiveTab] = useState<DeployTab>("overview");

  // Workspace modal state
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  // Create Project modal state
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<"FRONTEND" | "BACKEND" | "MONOREPO">("FRONTEND");
  const [projectWorkspaceId, setProjectWorkspaceId] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // GitHub integration state
  const [isGithubConnected, setIsGithubConnected] = useState<boolean | null>(null);
  const [checkingGithubConnection, setCheckingGithubConnection] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);

  const hasProjectSelected = !!selectedProjectId;

  // IMPORTANT: workspace “done” means selected, not “exists”

  const hasProcessedOAuthCode = useRef(false);

  const showConnectionLoading = checkingGithubConnection || isGithubConnected === null;
  const showConnectUI = isGithubConnected === false;
  const showRepoUI = isGithubConnected === true;

  // Overall page loading state
    const pageLoading =
    orgLoading ||
    !selectedOrg ||
    !wsAny;


  const checkGithubConnection = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsGithubConnected(false);
      return;
    }

    setCheckingGithubConnection(true);
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: IS_GITHUB_CONNECTED_MUTATION }),
      });

      const json = await res.json();
      const errors = getGqlErrors(json);
      if (errors?.length) {
        throw new Error(errors[0]?.message || "Failed to check GitHub connection");
      }

      const data = getGqlData(json);
      setIsGithubConnected(data?.isGithubConnected?.isConnected === true);
    } catch (e) {
      console.error("GitHub connection check failed:", e);
      setIsGithubConnected(false);
    } finally {
      setCheckingGithubConnection(false);
    }
  };

  const handleGithubCallback = async (code: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("No auth token found");
      return;
    }

    setConnectingGithub(true);
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: ADD_GITHUB_PROVIDER_MUTATION,
          variables: { code },
        }),
      });

      const json = await res.json();
      const errors = getGqlErrors(json);
      if (errors?.length) {
        throw new Error(errors[0]?.message || "Failed to connect GitHub");
      }

      const data = getGqlData(json);
      if (data?.addGithubProvider) {
        toast.success("GitHub connected successfully!");
        setIsGithubConnected(true);
        checkGithubConnection();
      } else {
        throw new Error("Failed to connect GitHub");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to connect GitHub";
      toast.error(msg);
    } finally {
      setConnectingGithub(false);
    }
  };

  const buildGitHubAuthUrl = (redirectTo: string): string => {
    const redirectUri = encodeURIComponent(`${import.meta.env.VITE_APP_URL}/oauth/github/callback`);
    const scope = encodeURIComponent("read:user user:email repo");

    const statePayload = {
      redirectTo,
      flow: "github_connect",
      nonce: crypto.randomUUID(),
    };

    const state = encodeURIComponent(JSON.stringify(statePayload));

    return (
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}` +
      `&state=${state}`
    );
  };

  // Only check github when a project exists
  useEffect(() => {
    if (hasProjectSelected) {
      checkGithubConnection();
    } else {
      setIsGithubConnected(null);
      setCheckingGithubConnection(false);
      setConnectingGithub(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, hasProjectSelected]);

  // Handle OAuth callback
  useEffect(() => {
    if (hasProcessedOAuthCode.current || !hasProjectSelected) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const rawState = urlParams.get("state");

    if (!code || !rawState) return;

    let parsedState: any = null;
    try {
      parsedState = JSON.parse(decodeURIComponent(rawState));
    } catch {
      return;
    }

    if (parsedState?.flow === "github_connect" && parsedState?.redirectTo === "/deploy") {
      setFreezeUI(true);
      hasProcessedOAuthCode.current = true;
      window.history.replaceState({}, document.title, "/deploy");
      handleGithubCallback(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProjectSelected]);

  const openCreateWorkspace = () => {
    setWorkspaceName("");
    setCreateWorkspaceOpen(true);
  };

  const submitCreateWorkspace = async () => {
    const name = workspaceName.trim();
    if (!name) return;

    if (typeof createWorkspace !== "function") {
      toast.error("Workspace creation is not available here yet (createWorkspace not found).");
      return;
    }

    setCreatingWorkspace(true);
    try {
      await createWorkspace(name);
      toast.success("Workspace created. Select it from the header Workspaces dropdown.");
      setCreateWorkspaceOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create workspace";
      toast.error(msg);
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const openCreateProject = () => {
    const defaultWs = projectWorkspaceId || selectedWorkspaceId || filteredWorkspaces[0]?.id || "";
    setProjectWorkspaceId(defaultWs);
    setProjectName("");
    setProjectType("FRONTEND");
    setCreateProjectOpen(true);
  };

  const submitCreateProject = async () => {
    const name = projectName.trim();
    if (!name) return;

    if (!projectWorkspaceId) {
      toast.error("Select or create a workspace first.");
      return;
    }

    // Frontend guards
    const workspace = filteredWorkspaces.find(w => w.id === projectWorkspaceId);
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }
    if (workspace.id.length < 10) {
      toast.error("Invalid workspace id");
      return;
    }

    setCreatingProject(true);
    try {
      await createProject(name, projectType, projectWorkspaceId);
      toast.success("Project created. Select it from the header Projects dropdown.");
      setCreateProjectOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create project";
      toast.error(msg);
    } finally {
      setCreatingProject(false);
    }
  };

  const onConnectGithub = () => {
    setFreezeUI(true); // 🔒 LOCK UI
    window.location.href = buildGitHubAuthUrl("/deploy");
  };

  const onConnectGitlab = () => toast("GitLab connect coming soon.");
  if (pageLoading) {
    return <DeployPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

    <div className="flex">
      {/* ================= SIDEBAR ================= */}
      <DeploySidebar
        activeTab={activeTab}
        onChange={setActiveTab}
        projectType={selectedProjectDetails?.projectType ?? null}

        // 🔒 HARD FREEZE SIDEBAR DURING OAUTH / LOADING
        hasWorkspace={true}
        hasProject={!!selectedProjectId}
        isRepoConnected={isGithubConnected === true}
        isLoading={
          orgLoading ||
          checkingGithubConnection ||
          connectingGithub
        }
        allowCreateWorkspace={false}

        connectedRepoKind={null}
        onCreateWorkspace={openCreateWorkspace}
        onCreateProject={openCreateProject}
        onConnectRepo={onConnectGithub}
        />


      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
  {/* ❌ Error */}
  {!!orgError && (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
      <span className="pr-2">{orgError}</span>
      <button
        type="button"
        onClick={clearError}
        className="font-bold text-red-600 hover:text-red-800"
      >
        ×
      </button>
    </div>
  )}

  {(
    orgLoading ||
    connectingGithub ||
    checkingGithubConnection ||
    window.location.pathname === "/oauth/github/callback"
  ) ? (
    /* 🔒 LOADING / OAUTH → ONLY SKELETON */
    <RepoSectionSkeleton />
  ) : !selectedWorkspaceId ? (
    /* 🟡 NO WORKSPACE */
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <h2 className={H2}>Create a workspace to continue</h2>
      <p className={cx("mt-2", P_SMALL)}>
        Create a workspace here, then select it from the header Workspaces dropdown.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={openCreateWorkspace}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Workspace <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  ) : !selectedProjectId ? (
    /* 🟡 NO PROJECT */
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
      <h2 className={H2}>Create a project to deploy</h2>
      <p className={cx("mt-2", P_SMALL)}>
        Create a project first, then connect GitHub to import repositories.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={openCreateProject}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Project <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  ) : isGithubConnected === false ? (
    /* 🟢 PROJECT → CONNECT REPO */
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onConnectGithub}
            className="w-full h-14 rounded-xl bg-gray-900 text-white font-semibold"
          >
            <Github className="h-5 w-5 mr-2 inline" />
            Connect to GitHub
          </button>

          <button
            type="button"
            onClick={onConnectGitlab}
            className="w-full h-14 rounded-xl bg-orange-600 text-white font-semibold"
          >
            <Gitlab className="h-5 w-5 mr-2 inline" />
            Connect with GitLab
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center text-gray-400 font-semibold">
          OR
        </div>

        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <p className="text-lg font-semibold text-blue-700 mb-1">
                Drag & Drop files here
              </p>
              <p className="text-sm text-blue-600/80">
                or click to browse
              </p>
            </div>

            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              <FolderOpen className="h-4 w-4" />
              Browse Files
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    /* ✅ REPO CONNECTED */
    <RepoImportPanel open />
  )}
</main>



      {/* Create Workspace Modal */}
      <Modal
        open={createWorkspaceOpen}
        title="Create a workspace"
        subtitle={selectedOrg?.name ? `Org: ${selectedOrg.name}` : "Select an organization"}
        onClose={() => !creatingWorkspace && setCreateWorkspaceOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={cx(typo.labels.form.size, typo.labels.form.weight, typo.labels.form.color)}>
              Workspace name
            </label>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Ex: My Workspace"
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={creatingWorkspace}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateWorkspaceOpen(false)}
              disabled={creatingWorkspace}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submitCreateWorkspace}
              disabled={creatingWorkspace || !workspaceName.trim()}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {creatingWorkspace ? "Creating..." : <>Create <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        open={createProjectOpen}
        title="Create a project"
        subtitle={
          selectedOrg?.name
            ? `Org: ${selectedOrg.name}${selectedWorkspace?.name ? ` • Workspace: ${selectedWorkspace.name}` : ""}`
            : "Select an organization"
        }
        onClose={() => !creatingProject && setCreateProjectOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={cx(typo.labels.form.size, typo.labels.form.weight, typo.labels.form.color)}>
              Workspace
            </label>
            <select
              value={projectWorkspaceId}
              onChange={(e) => setProjectWorkspaceId(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={creatingProject}
              aria-label="Select workspace"
            >
              {filteredWorkspaces.length === 0 ? (
                <option value="">No workspaces available</option>
              ) : (
                filteredWorkspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className={cx(typo.labels.form.size, typo.labels.form.weight, typo.labels.form.color)}>
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

          <div className="space-y-2">
            <label className={cx(typo.labels.form.size, typo.labels.form.weight, typo.labels.form.color)}>
              What type of project is this?
            </label>
            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 gap-1">
              {(["FRONTEND", "BACKEND", "MONOREPO"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setProjectType(opt)}
                  disabled={creatingProject}
                  className={cx(
                    "px-4 py-1.5 text-sm rounded-full transition-all duration-200",
                    projectType === opt
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm",
                    creatingProject ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {opt === "FRONTEND" ? "Frontend" : opt === "BACKEND" ? "Backend" : "Monorepo"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateProjectOpen(false)}
              disabled={creatingProject}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submitCreateProject}
              disabled={
                creatingProject ||
                !projectName.trim() ||
                !projectWorkspaceId ||
                filteredWorkspaces.length === 0
              }
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {creatingProject ? "Creating..." : <>Create <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}