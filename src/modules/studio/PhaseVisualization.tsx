import React, { useState } from "react";
import {
  Users,
  Shield,
  Key,
  UserCog,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  Globe,
  ListTodo,
  LayoutGrid,
  Lock,
  Boxes,
  Zap,
  Link2,
} from "lucide-react";

import {
  type Feature,
  type AuthenticationData,
  type Role,
  type DiscoveryData,
  type Entity,
  type RestEndpoint,
  type GraphQLAPI,
  cx,
  featureColors,
  roleColors,
  entityColors,
  getFieldTypeIcon,
  getFieldTypeColor,
} from "./PhaseVisualization.types";

type PhaseVisualizationV2Props = {
  discoveryData: DiscoveryData | null;
  features: Feature[];
  authData: AuthenticationData | null;
  roles: Role[];
  entities: Entity[];
  apiStyle: string | null;
  restEndpoints: RestEndpoint[];
  graphqlAPI: GraphQLAPI | null;
  activePhase?: string | null;
};

// --- Tab Button ---

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
        active
          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <Icon size={14} />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cx(
          "text-[10px] px-1.5 py-0.5 rounded-full",
          active
            ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// --- Project Header ---

const ProjectHeader = ({ data }: { data: DiscoveryData }) => {
  if (!data.project_name && !data.core_problem && (!data.target_users || data.target_users.length === 0)) {
    return null;
  }

  return (
    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      {data.project_name && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">App Name</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
            {data.project_name}
          </h2>
        </div>
      )}

      {data.core_problem && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Core Problem</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
            {data.core_problem}
          </p>
        </div>
      )}

      {data.target_users && data.target_users.length > 0 && (
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target Users</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {data.target_users.map((user, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50"
              >
                <Users size={10} />
                {user}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Section Card ---

const SectionCard = ({
  title,
  icon: Icon,
  count,
  children,
  defaultExpanded = true,
  iconColor = "text-gray-500 dark:text-gray-400",
  headerAccent,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  iconColor?: string;
  headerAccent?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cx(
          "w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          headerAccent
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={iconColor} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({count})</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Features List ---

const FeaturesList = ({ features, defaultExpanded }: { features: Feature[], defaultExpanded?: boolean }) => {
  if (features.length === 0) return null;

  return (
    <SectionCard
      title="Features"
      icon={Boxes}
      count={features.length}
      iconColor="text-violet-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-2">
        {features.map((feature, idx) => {
          const colorSet = featureColors[idx % featureColors.length];
          return (
            <div
              key={feature.id}
              className={cx(
                "flex items-start gap-3 py-2.5 px-3 rounded-lg border-l-3",

                colorSet.border,
                "border border-transparent"
              )}
              style={{ borderLeftWidth: '3px' }}
            >
              <div className="mt-0.5 text-gray-400 dark:text-gray-500">
                <Zap size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {feature.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {feature.short_description}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1.5 py-0.5">
                #{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

// --- Authentication Card ---

const AuthenticationCard = ({ data, defaultExpanded }: { data: AuthenticationData, defaultExpanded?: boolean }) => {
  return (
    <SectionCard
      title="Authentication"
      icon={Shield}
      iconColor="text-emerald-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Authentication Required</span>
          </div>
          <span className={cx(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            data.auth_required
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          )}>
            {data.auth_required ? "✓ Yes" : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Multi-Factor Auth (MFA)</span>
          </div>
          <span className={cx(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            data.mfa_required
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          )}>
            {data.mfa_required ? "✓ Enabled" : "Disabled"}
          </span>
        </div>

        {data.methods && data.methods.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Key size={12} />
              Authentication Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {data.methods.map((method, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                >
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

// --- Roles Card ---

const RolesCard = ({ roles, defaultExpanded }: { roles: Role[], defaultExpanded?: boolean }) => {
  if (roles.length === 0) return null;

  return (
    <SectionCard
      title="Roles & Permissions"
      icon={UserCog}
      count={roles.length}
      iconColor="text-purple-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        {roles.map((role, idx) => {
          const colorSet = roleColors[idx % roleColors.length];
          return (
            <div
              key={role.role}
              className={cx(
                "rounded-lg border overflow-hidden",
                colorSet.border
              )}
            >
              <div className={cx("px-3 py-2.5 border-b", colorSet.bg, colorSet.border)}>
                <div className="flex items-center gap-2">
                  <UserCog size={14} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.role}</span>
                  <span className={cx("text-[10px] px-1.5 py-0.5 rounded-full ml-auto", colorSet.badge)}>
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>
              {role.permissions.length > 0 && (
                <div className="p-3 bg-white dark:bg-gray-800/50">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((perm, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md"
                      >
                        <Check size={10} className="text-emerald-500" />
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

// --- Data Models Card ---

const DataModelsCard = ({ entities, defaultExpanded }: { entities: Entity[], defaultExpanded?: boolean }) => {
  const [expandedEntity, setExpandedEntity] = useState<string | null>(entities[0]?.name || null);

  if (entities.length === 0) return null;

  return (
    <SectionCard
      title="Data Models"
      icon={Database}
      count={entities.length}
      iconColor="text-blue-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-3">
        {entities.map((entity, idx) => {
          const colorSet = entityColors[idx % entityColors.length];
          const isExpanded = expandedEntity === entity.name;

          return (
            <div
              key={entity.name}
              className={cx(
                "rounded-lg border overflow-hidden transition-all",
                isExpanded ? colorSet.border : "border-gray-200 dark:border-gray-700"
              )}
            >
              <button
                onClick={() => setExpandedEntity(isExpanded ? null : entity.name)}
                className={cx(
                  "w-full px-3 py-2.5 flex items-center justify-between transition-colors",
                  isExpanded ? colorSet.header : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Database size={14} className={isExpanded ? colorSet.icon : "text-gray-400"} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{entity.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cx(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    isExpanded
                      ? "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {entity.fields.length} fields
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 bg-white dark:bg-gray-800/50">
                  <div className="mt-2 space-y-1.5">
                    {entity.fields.map((field) => {
                      const FieldIcon = getFieldTypeIcon(field.type);
                      const typeColor = getFieldTypeColor(field.type);

                      return (
                        <div
                          key={field.name}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cx("p-1 rounded", typeColor)}>
                              <FieldIcon size={10} />
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.name}</span>
                            {field.primary && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                                PK
                              </span>
                            )}
                            {field.unique && !field.primary && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                                UQ
                              </span>
                            )}
                          </div>
                          <span className={cx("text-xs px-2 py-0.5 rounded-full", typeColor)}>
                            {field.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {entity.relationships && entity.relationships.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                        <Link2 size={12} />
                        Relationships
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {entity.relationships.map((rel, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50"
                          >
                            <Link2 size={10} />
                            <span className="font-medium">{rel.with}</span>
                            <span className="text-indigo-400 dark:text-indigo-500">({rel.type.replace('_', ' ')})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

// --- API Card ---

const APICard = ({
  apiStyle,
  restEndpoints,
  graphqlAPI,
  defaultExpanded
}: {
  apiStyle: string | null;
  restEndpoints: RestEndpoint[];
  graphqlAPI: GraphQLAPI | null;
  defaultExpanded?: boolean;
}) => {
  if (!apiStyle && restEndpoints.length === 0 && !graphqlAPI) return null;

  const [activeMethodFilter, setActiveMethodFilter] = useState<string | null>(null);

  const methodConfig: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    GET: {
      bg: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800/50",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    POST: {
      bg: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800/50",
      lightBg: "bg-blue-50 dark:bg-blue-900/20"
    },
    PUT: {
      bg: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800/50",
      lightBg: "bg-amber-50 dark:bg-amber-900/20"
    },
    PATCH: {
      bg: "bg-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800/50",
      lightBg: "bg-orange-50 dark:bg-orange-900/20"
    },
    DELETE: {
      bg: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800/50",
      lightBg: "bg-red-50 dark:bg-red-900/20"
    },
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const methodCounts = methods.reduce((acc, method) => {
    if (method === 'PUT') {
      acc[method] = restEndpoints.filter(e => e.method === 'PUT' || e.method === 'PATCH').length;
    } else {
      acc[method] = restEndpoints.filter(e => e.method === method).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredEndpoints = activeMethodFilter
    ? restEndpoints.filter(e => {
      if (activeMethodFilter === 'PUT') {
        return e.method === 'PUT' || e.method === 'PATCH';
      }
      return e.method === activeMethodFilter;
    })
    : restEndpoints;

  const graphqlCount = graphqlAPI
    ? graphqlAPI.queries.length + graphqlAPI.mutations.length + (graphqlAPI.subscriptions?.length ?? 0)
    : 0;

  const totalEndpoints = restEndpoints.length + graphqlCount;

  return (
    <SectionCard
      icon={Globe}
      count={totalEndpoints}
      iconColor="text-cyan-500"
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">

        {apiStyle && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>API Style:</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {apiStyle}
            </span>
          </div>
        )}

        {/* REST Endpoints */}
        {restEndpoints.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">REST Endpoints</p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {restEndpoints.length} total
              </span>
            </div>

            {/* Method Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setActiveMethodFilter(null)}
                className={cx(
                  "text-xs px-2.5 py-1 rounded-full transition-all font-medium",
                  activeMethodFilter === null
                    ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                All ({restEndpoints.length})
              </button>
              {methods.map((method) => {
                const config = methodConfig[method];
                const count = methodCounts[method];
                if (count === 0) return null;

                return (
                  <button
                    key={method}
                    onClick={() => setActiveMethodFilter(activeMethodFilter === method ? null : method)}
                    className={cx(
                      "text-xs px-2.5 py-1 rounded-full transition-all font-medium border",
                      activeMethodFilter === method
                        ? `${config.bg} text-white border-transparent`
                        : `${config.lightBg} ${config.text} ${config.border} hover:opacity-80`
                    )}
                  >
                    {method} ({count})
                  </button>
                );
              })}
            </div>

            {/* Endpoints List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredEndpoints.map((endpoint, idx) => {
                const config = methodConfig[endpoint.method] || methodConfig.GET;

                return (
                  <div
                    key={idx}
                    className={cx(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:shadow-sm",
                      config.lightBg,
                      config.border
                    )}
                  >
                    <span className={cx(
                      "text-[10px] font-bold px-2 py-1 rounded text-white shrink-0 min-w-[52px] text-center",
                      config.bg
                    )}>
                      {endpoint.method}
                    </span>
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 break-all">
                      {endpoint.path}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {endpoint.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                          Auth
                        </span>
                      )}
                      {endpoint.roles && endpoint.roles.length > 0 && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {endpoint.roles.length} role{endpoint.roles.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GraphQL */}
        {graphqlAPI && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                GraphQL Operations
              </p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {graphqlCount} total
              </span>
            </div>

            {graphqlAPI.queries.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Queries</p>
                <div className="space-y-1.5">
                  {graphqlAPI.queries.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                        Q
                      </span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{query.name}</span>
                      {query.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {graphqlAPI.mutations.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Mutations</p>
                <div className="space-y-1.5">
                  {graphqlAPI.mutations.map((mutation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
                        M
                      </span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{mutation.name}</span>
                      {mutation.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {graphqlAPI.subscriptions && graphqlAPI.subscriptions.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">Subscriptions</p>
                <div className="space-y-1.5">
                  {graphqlAPI.subscriptions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800/50"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-white">
                        S
                      </span>
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1">{sub.name}</span>
                      {sub.authRequired && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          <Lock size={8} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

// --- Checklist Content (Blurred placeholder) ---

const ChecklistContent = () => {
  const placeholderItems = [
    "Set up project structure and dependencies",
    "Configure authentication and user management",
    "Design and implement database schema",
    "Create API endpoints for core features",
    "Implement frontend components and views",
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">Project tasks and requirements</p>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          0/5 completed
        </span>
      </div>

      <div className="relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-gray-900/60 dark:to-gray-900 z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock size={20} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coming Soon</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Checklist will be available soon</p>
          </div>
        </div>

        {/* Blurred content */}
        <div className="space-y-2 filter blur-[2px] pointer-events-none select-none">
          {placeholderItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Visualization Content ---

const VisualizationContent = ({
  discoveryData,
  features,
  authData,
  roles,
  entities,
  apiStyle,
  restEndpoints,
  graphqlAPI,
  activePhase,
}: PhaseVisualizationV2Props) => {
  const hasContent =
    features.length > 0 ||
    (authData !== null && (authData.auth_required || authData.methods.length > 0)) ||
    roles.length > 0 ||
    entities.length > 0 ||
    restEndpoints.length > 0 ||
    graphqlAPI !== null;

  if (!hasContent) {
    return (
      <div className="p-4 text-center py-12">
        <Layers size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No visualizations yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Details will appear as you describe your app</p>
      </div>
    );
  }

  const getIsActive = (section: string) => {
    if (!activePhase) return true;
    const p = activePhase.toUpperCase();

    if (section === 'FEATURES') {
      return p.includes('DISCOVERY');
    }
    if (section === 'AUTH') {
      return p.includes('AUTHENTICATION');
    }
    if (section === 'ROLES') {
      return p.includes('AUTHORIZATION');
    }
    if (section === 'DATAMODELS') {
      return p.includes('DATAMODELS');
    }
    if (section === 'API') {
      return p.includes('API');
    }

    return false;
  };

  return (
    <div className="p-4">
      {discoveryData && <ProjectHeader data={discoveryData} />}
      <FeaturesList features={features} defaultExpanded={getIsActive('FEATURES')} />
      {authData && <AuthenticationCard data={authData} defaultExpanded={getIsActive('AUTH')} />}
      <RolesCard roles={roles} defaultExpanded={getIsActive('ROLES')} />
      <DataModelsCard entities={entities} defaultExpanded={getIsActive('DATA')} />
      <APICard apiStyle={apiStyle} restEndpoints={restEndpoints} graphqlAPI={graphqlAPI} defaultExpanded={getIsActive('API')} />
      <div className="h-4" />
    </div>
  );
};

// --- Empty State ---

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
      <Layers size={20} className="text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Blueprint</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
      Your project details will appear here as you describe your app.
    </p>
  </div>
);

// --- Main Component ---

export default function PhaseVisualizationV2({
  discoveryData,
  features,
  authData,
  roles,
  entities,
  apiStyle,
  restEndpoints,
  graphqlAPI,
  activePhase,
}: PhaseVisualizationV2Props) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'visual'>('visual');

  const hasContent =
    features.length > 0 ||
    (authData !== null && (authData.auth_required || authData.methods.length > 0)) ||
    roles.length > 0 ||
    entities.length > 0 ||
    restEndpoints.length > 0 ||
    graphqlAPI !== null;

  if (!hasContent && !discoveryData) {
    return <EmptyState />;
  }

  const visualCount =
    (features.length > 0 ? 1 : 0) +
    (authData ? 1 : 0) +
    (roles.length > 0 ? 1 : 0) +
    (entities.length > 0 ? 1 : 0) +
    ((restEndpoints.length > 0 || graphqlAPI) ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Tab Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          <TabButton
            active={activeTab === 'checklist'}
            onClick={() => setActiveTab('checklist')}
            icon={ListTodo}
            label="Checklist"
            count={5}
          />
          <TabButton
            active={activeTab === 'visual'}
            onClick={() => setActiveTab('visual')}
            icon={LayoutGrid}
            label="Visual Cards"
            count={visualCount}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'checklist' ? (
          <ChecklistContent />
        ) : (
          <VisualizationContent
            key={activePhase || 'default'}
            discoveryData={discoveryData}
            features={features}
            authData={authData}
            roles={roles}
            entities={entities}
            apiStyle={apiStyle}
            restEndpoints={restEndpoints}
            graphqlAPI={graphqlAPI}
            activePhase={activePhase}
          />
        )}
      </div>
    </div>
  );
}

export type {
  Feature,
  AuthenticationData,
  Role,
  DiscoveryData,
  Entity,
  RestEndpoint,
  GraphQLAPI,
};