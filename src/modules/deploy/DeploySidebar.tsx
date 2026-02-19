import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Monitor,
  Server,
  Rocket,
  Layers,
  Globe,
  BarChart3,
  Settings,
  Plus,
  Link2,
  Clock,
  Github,
} from "lucide-react";

export type DeployTab =
  | "overview"
  | "integrations"
  | "deployments"
  | "activity"
  | "domains"
  | "usage"
  | "observability"
  | "storage"
  | "flags"
  | "ai-gateway"
  | "agent"
  | "support"
  | "settings";

type RepoAppKind = "frontend" | "backend" | null;
type MenuItemKey = "deploy" | "deployments" | "domains" | "usage" | "settings";
type Scope = "frontend" | "backend";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const MENU_ITEMS: Array<{
  key: MenuItemKey;
  label: string;
  tab: DeployTab;
  icon: typeof Rocket;
  description: string;
}> = [
  { key: "deploy", label: "Deploy", tab: "overview", icon: Rocket, description: "Deploy your app" },
  { key: "deployments", label: "Deployments", tab: "deployments", icon: Layers, description: "View history" },
  { key: "domains", label: "Domains", tab: "domains", icon: Globe, description: "Manage domains" },
  { key: "usage", label: "Usage", tab: "usage", icon: BarChart3, description: "Analytics & stats" },
  { key: "settings", label: "Settings", tab: "settings", icon: Settings, description: "Configuration" },
];

type QuickItem = {
  id: string;
  path: string;
  tab: DeployTab;
  scope: Scope;
  key: MenuItemKey;
};

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
      {text}
    </div>
  );
}

function AccordionHeader(props: {
  title: string;
  icon: ReactNode;
  open: boolean;
  onClick: () => void;
  variant: "blue" | "indigo";
}) {
  const { title, icon, open, onClick, variant } = props;

  const gradientClass =
    variant === "blue"
      ? "from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300"
      : "from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group w-full flex items-center justify-between rounded-xl border-2 bg-gradient-to-br px-3 py-2",
        "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        gradientClass
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className={cx(
            "inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 shadow-sm transition-transform group-hover:scale-110",
            variant === "blue" ? "bg-white border-blue-300" : "bg-white border-indigo-300"
          )}
        >
          {icon}
        </span>
        <span className="text-sm font-bold text-gray-900">{title}</span>
      </span>

      <ChevronDown
        className={cx(
          "w-4 h-4 text-gray-500 transition-all duration-300",
          open ? "rotate-180 text-gray-700" : "group-hover:translate-y-0.5"
        )}
      />
    </button>
  );
}

function ActionButton(props: {
  variant: "blue" | "indigo";
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { variant, label, icon, onClick, disabled } = props;

  const colors =
    variant === "blue"
      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200"
      : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5",
        "text-sm font-bold text-white transition-all duration-200",
        "shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        colors,
        disabled && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function DeploySidebar(props: {
  activeTab: DeployTab;
  onChange: (tab: DeployTab) => void;

  hasWorkspace?: boolean;
  hasProject?: boolean;
  isRepoConnected?: boolean;
  connectedRepoKind?: RepoAppKind;
  isLoading?: boolean;
  allowCreateWorkspace?: boolean;


  projectType?: "FRONTEND" | "BACKEND" | "MONOREPO" | null;

  onCreateWorkspace?: () => void;
  onCreateProject?: () => void;
  onConnectRepo?: () => void;
  onCreateNewProject?: () => void;
}) {
  const {
    allowCreateWorkspace = true,
    onChange,
    hasWorkspace,
    hasProject,
    isRepoConnected = false,
    connectedRepoKind = null,
    isLoading,
    projectType = null,
    onCreateWorkspace,
    onCreateProject,
    onConnectRepo,
    onCreateNewProject,
  } = props;

  // Only allow navigating to the 5 items once workspace+project exists and GitHub is connected.
  const canNavigate = !isLoading && hasWorkspace && hasProject && isRepoConnected;

  // Determine what to show based on projectType
  const showFrontendAccordion = projectType === null || projectType === "FRONTEND";
  const showBackendAccordion = projectType === null || projectType === "BACKEND";
  const showBaseItemsOnly = projectType === "MONOREPO";

  const [frontendOpen, setFrontendOpen] = useState(true);
  const [backendOpen, setBackendOpen] = useState(true);

  const [frontendSelected, setFrontendSelected] = useState<MenuItemKey | null>(null);
  const [backendSelected, setBackendSelected] = useState<MenuItemKey | null>(null);

  const [quickItems, setQuickItems] = useState<QuickItem[]>([]);

  const actionLabel = useMemo(() => {
    if (isRepoConnected === false) return "+ Connect to GitHub";
    if (allowCreateWorkspace === false) {
      if (hasProject === false) return "+ Create Project";
      return "";
    }
    if (hasWorkspace === false) return "+ Create Workspace";
    if (hasProject === false) return " Create Project";
    return "";
  }, [isLoading, hasWorkspace, hasProject, isRepoConnected]);

  const runPrimaryAction = () => {
    if (allowCreateWorkspace === false) {
      if (hasProject === false) return onCreateProject?.();
      if (isRepoConnected === false) return onConnectRepo?.();
      return;
    }
    if (hasWorkspace === false) return onCreateWorkspace?.();
    if (hasProject === false) return onCreateProject?.();
    if (isRepoConnected === false) return onConnectRepo?.();
  };

  const pushQuick = (item: Omit<QuickItem, "id">) => {
    setQuickItems((prev) => {
      const next: QuickItem[] = [
        ...prev,
        { ...item, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
      ];
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });
  };

  const applySelectionFromQuick = (qi: QuickItem) => {
    if (!canNavigate) return;

    if (qi.scope === "frontend") setFrontendSelected(qi.key);
    if (qi.scope === "backend") setBackendSelected(qi.key);
    onChange(qi.tab);
  };

  const pick = (scope: Scope, key: MenuItemKey) => {
    if (!canNavigate) return;

    const item = MENU_ITEMS.find((x) => x.key === key);
    if (!item) return;

    const path = scope === "frontend" ? `Frontend → ${item.label}` : `Backend → ${item.label}`;

    if (scope === "frontend") setFrontendSelected(key);
    if (scope === "backend") setBackendSelected(key);

    pushQuick({ path, tab: item.tab, scope, key });
    onChange(item.tab);
  };

  const renderItems = (scope: Scope, selectedKey: MenuItemKey | null) => {
    return (
      <div className="space-y-1.5">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = selectedKey === item.key;

          return (
            <button
              key={`${scope}-${item.key}`}
              type="button"
              onClick={() => pick(scope, item.key)}
              className={cx(
                "group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200",
                "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                isActive
                  ? "bg-gradient-to-r from-gray-900 to-gray-800 border-gray-900 shadow-lg"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
              disabled={!canNavigate}
            >
              <span
                className={cx(
                  "w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-200",
                  "group-hover:scale-110",
                  isActive
                    ? "bg-white border-white shadow-md"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                )}
              >
                <Icon className={cx("w-4.5 h-4.5", isActive ? "text-gray-900" : "text-gray-700")} />
              </span>

              <div className="flex-1 text-left min-w-0">
                <div className={cx("text-sm font-bold truncate", isActive ? "text-white" : "text-gray-900")}>
                  {item.label}
                </div>
                <div className={cx("text-xs truncate", isActive ? "text-gray-300" : "text-gray-500")}>
                  {item.description}
                </div>
              </div>

              
            </button>
          );
        })}
      </div>
    );
  };

  // If workspace/project is missing, do NOT show FE/BE/Monorepo accordions at all.
  const showNavSections = hasWorkspace === true && hasProject === true;

  return (
    <aside className="hidden lg:block w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 min-h-[calc(100vh-65px)] sticky top-[65px]">
      <div className="p-4 space-y-5">
        {/* QUICK OPTIONS */}
        <div>
          <SectionTitle text="Quick Access" />

          <div className="rounded-2xl border-2 border-gray-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Recent Activity
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickItems.length === 0 ? (
                <div className="w-full text-center py-4 px-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-sm text-gray-500">
                    {canNavigate
                      ? "Click any item below to start tracking your navigation"
                      : "Create workspace/project and connect GitHub to enable navigation"}
                  </div>
                </div>
              ) : (
                quickItems.map((qi) => (
                  <button
                    key={qi.id}
                    type="button"
                    onClick={() => applySelectionFromQuick(qi)}
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-full border-2",
                      "bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50",
                      "border-gray-200 hover:border-gray-300 px-2.5 py-1.5 transition-all duration-200",
                      "text-xs font-semibold text-gray-800 hover:shadow-md hover:scale-105",
                      !canNavigate && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
                    )}
                    title={qi.path}
                    disabled={!canNavigate}
                  >
                    {qi.scope === "frontend" ? (
                      <Monitor className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Server className="w-3 h-3 text-indigo-600" />
                    )}
                    <span className="max-w-[140px] truncate">{qi.path}</span>
                  </button>
                ))
              )}
            </div>

            {(actionLabel || connectedRepoKind === "backend" || connectedRepoKind === "frontend") && (
              <div className="mt-3 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-2.5">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5">
                  Quick Actions
                </div>

                <div className="space-y-1.5">
                  {connectedRepoKind === "backend" && (
                    <button
                      type="button"
                      onClick={onCreateNewProject}
                      className="w-full inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Create Frontend Project
                    </button>
                  )}

                  {connectedRepoKind === "frontend" && (
                    <button
                      type="button"
                      onClick={onCreateNewProject}
                      className="w-full inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      Create Backend Project
                    </button>
                  )}
                  
                  {actionLabel && (
                    <ActionButton
                      variant="blue"
                      label={actionLabel}
                      icon={
                        hasWorkspace === false || hasProject === false
                          ? <Plus className="w-4 h-4" />
                          : !isRepoConnected
                            ? <Github className="w-4 h-4" />
                            : <Link2 className="w-4 h-4" />
                      }
                      onClick={runPrimaryAction}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAV SECTIONS */}
        {showNavSections && (
          <>
            {/* FRONTEND ACCORDION */}
            {showFrontendAccordion && !showBaseItemsOnly && (
              <div className="space-y-2.5">
                <AccordionHeader
                  title="Frontend"
                  icon={<Monitor className="w-4.5 h-4.5 text-blue-600" />}
                  open={frontendOpen}
                  onClick={() => setFrontendOpen((v) => !v)}
                  variant="blue"
                />

                {frontendOpen && (
                  <div className="rounded-2xl border-2 border-gray-200 bg-white p-3.5 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {connectedRepoKind === "backend" && (
                      <button
                        type="button"
                        onClick={onCreateNewProject}
                        className="w-full inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-2 text-sm font-bold text-gray-800 hover:from-blue-100 hover:to-blue-200/50 transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        Create New Project
                      </button>
                    )}

                    {actionLabel && (
                      <ActionButton
                        variant="blue"
                        label={actionLabel}
                        icon={!isRepoConnected ? <Github className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        onClick={runPrimaryAction}
                      />
                    )}

                    {/* Show the 5 items ONLY when GitHub is connected */}
                    {isRepoConnected ? renderItems("frontend", frontendSelected) : null}
                  </div>
                )}
              </div>
            )}

            {/* BACKEND ACCORDION */}
            {showBackendAccordion && !showBaseItemsOnly && (
              <div className="space-y-2.5">
                <AccordionHeader
                  title="Backend"
                  icon={<Server className="w-4.5 h-4.5 text-indigo-600" />}
                  open={backendOpen}
                  onClick={() => setBackendOpen((v) => !v)}
                  variant="indigo"
                />

                {backendOpen && (
                  <div className="rounded-2xl border-2 border-gray-200 bg-white p-3.5 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {connectedRepoKind === "frontend" && (
                      <button
                        type="button"
                        onClick={onCreateNewProject}
                        className="w-full inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-3 py-2 text-sm font-bold text-gray-800 hover:from-indigo-100 hover:to-indigo-200/50 transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        Create New Project
                      </button>
                    )}

                    {actionLabel && (
                      <ActionButton
                        variant="indigo"
                        label={actionLabel}
                        icon={!isRepoConnected ? <Github className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        onClick={runPrimaryAction}
                      />
                    )}

                    {/* Show the 5 items ONLY when GitHub is connected */}
                    {isRepoConnected ? renderItems("backend", backendSelected) : null}
                  </div>
                )}
              </div>
            )}

            {/* MONOREPO */}
            {showBaseItemsOnly && (
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  Monorepo Actions
                </div>
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-3.5 shadow-sm space-y-2.5">
                  {actionLabel && (
                    <ActionButton
                      variant="blue"
                      label={actionLabel}
                      icon={!isRepoConnected ? <Github className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      onClick={runPrimaryAction}
                    />
                  )}

                  {/* Show the 5 items ONLY when GitHub is connected */}
                  {isRepoConnected ? renderItems("frontend", frontendSelected) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}