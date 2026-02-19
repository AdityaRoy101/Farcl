// Types, utilities, and GraphQL helpers for FarclStudioV2

export type Mode = "chat" | "database" | "editor";
export type MessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  isAnimated?: boolean;
  thinkingDuration?: number;
  dataSummary?: {
    entities?: number;
    restEndpoints?: number;
    graphqlQueries?: number;
    graphqlMutations?: number;
  };
};

export function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// ------------ GraphQL helpers & mutations ------------

export const STUDIO_GRAPHQL_URL =
  import.meta.env.VITE_FARCL_STUDIO_URL || "http://localhost:8001/v1/farcl";

export function getGqlErrors(json: any): Array<{ message?: string }> {
  return json?.errors ?? json?.body?.singleResult?.errors ?? [];
}

export function getGqlData(json: any): any {
  return json?.data ?? json?.body?.singleResult?.data ?? null;
}

export const CREATE_CONVERSATION_MUTATION = `
mutation CreateCoversation($projectId: String!, $workspaceId: String!) {
  createCoversation(projectId: $projectId, workspaceId: $workspaceId)
}
`;

export const GET_PHASE_MUTATION = `
mutation GetPhase($conversationId: String!) {
  getPhase(conversationId: $conversationId)
}
`;

export const CONTINUE_CONVERSATION_V2_MUTATION = `
mutation ContinueCoversationV2(
  $conversationId: String!,
  $message: String!,
  $isInitialConversation: Boolean!,
  $phase: String!,
  $version: String!
) {
  continueCoversationV2(
    conversationId: $conversationId,
    message: $message,
    isInitialConversation: $isInitialConversation,
    phase: $phase,
    version: $version
  )
}
`;