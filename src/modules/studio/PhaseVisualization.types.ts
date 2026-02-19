// Types, utilities, and color configurations for PhaseVisualizationV2

import {
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  AtSign,
  Circle,
} from "lucide-react";

// --- Types ---

export type Feature = {
  id: string;
  name: string;
  short_description: string;
};

export type DiscoveryData = {
  project_name?: string;
  core_problem?: string;
  target_users?: string[];
};

export type AuthenticationData = {
  auth_required: boolean;
  mfa_required: boolean;
  methods: string[];
};

export type Role = {
  role: string;
  permissions: string[];
};

export type EntityField = {
  name: string;
  type: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
};

export type EntityRelationship = {
  with: string;
  type: string;
};

export type Entity = {
  name: string;
  fields: EntityField[];
  relationships?: EntityRelationship[];
};

export type RestEndpoint = {
  method: string;
  path: string;
  authRequired: boolean;
  roles: string[];
};

export type GraphQLOperation = {
  name: string;
  description?: string;
  authRequired: boolean;
  roles: string[];
  input?: string;
  returns?: string;
};

export type GraphQLAPI = {
  endpoint: string;
  queries: GraphQLOperation[];
  mutations: GraphQLOperation[];
  subscriptions?: GraphQLOperation[];
};

export function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// --- Color utilities ---

export const featureColors = [
  { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-l-blue-400", icon: "text-blue-500" },
  { bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-l-violet-400", icon: "text-violet-500" },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-l-emerald-400", icon: "text-emerald-500" },
  { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-l-amber-400", icon: "text-amber-500" },
  { bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-l-rose-400", icon: "text-rose-500" },
  { bg: "bg-cyan-50 dark:bg-cyan-900/20", border: "border-l-cyan-400", icon: "text-cyan-500" },
  { bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-l-indigo-400", icon: "text-indigo-500" },
  { bg: "bg-teal-50 dark:bg-teal-900/20", border: "border-l-teal-400", icon: "text-teal-500" },
];

export const roleColors = [
  { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  { bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" },
];

export const entityColors = [
  { header: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30", icon: "text-blue-500", border: "border-blue-200 dark:border-blue-800" },
  { header: "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30", icon: "text-violet-500", border: "border-violet-200 dark:border-violet-800" },
  { header: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30", icon: "text-emerald-500", border: "border-emerald-200 dark:border-emerald-800" },
  { header: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30", icon: "text-amber-500", border: "border-amber-200 dark:border-amber-800" },
  { header: "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30", icon: "text-rose-500", border: "border-rose-200 dark:border-rose-800" },
  { header: "bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-900/30 dark:to-sky-900/30", icon: "text-cyan-500", border: "border-cyan-200 dark:border-cyan-800" },
];

export const getFieldTypeIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('id') || lowerType.includes('uuid')) return Hash;
  if (lowerType.includes('string') || lowerType.includes('text') || lowerType.includes('varchar')) return Type;
  if (lowerType.includes('date') || lowerType.includes('time')) return Calendar;
  if (lowerType.includes('bool')) return ToggleLeft;
  if (lowerType.includes('email')) return AtSign;
  if (lowerType.includes('int') || lowerType.includes('number') || lowerType.includes('float') || lowerType.includes('decimal')) return Hash;
  return Circle;
};

export const getFieldTypeColor = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('id') || lowerType.includes('uuid')) return "text-violet-500 bg-violet-50 dark:bg-violet-900/30";
  if (lowerType.includes('string') || lowerType.includes('text') || lowerType.includes('varchar')) return "text-blue-500 bg-blue-50 dark:bg-blue-900/30";
  if (lowerType.includes('date') || lowerType.includes('time')) return "text-amber-500 bg-amber-50 dark:bg-amber-900/30";
  if (lowerType.includes('bool')) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30";
  if (lowerType.includes('email')) return "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30";
  if (lowerType.includes('int') || lowerType.includes('number') || lowerType.includes('float') || lowerType.includes('decimal')) return "text-orange-500 bg-orange-50 dark:bg-orange-900/30";
  return "text-gray-500 bg-gray-50 dark:bg-gray-800";
};