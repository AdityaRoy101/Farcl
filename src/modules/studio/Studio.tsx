import React, { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Database as DatabaseIcon,
  Send,
  Copy,
  Bot,
  Check,
  Lock,
  FileCode,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

import { Header } from "../../components/Header/Header";
import { HeaderSkeleton } from "../../components/Skeleton/Skeleton";
import { useOrg, useWorkspace, useProject } from "../../contexts/workspace";
import { useAuthStore, selectUser } from "../../stores/auth";
import { useUserDisplayStore } from "../../stores/auth/userDisplay";
import { AppAvatar } from "../../components/ui/AppAvatar";
import PhaseVisualizationV2, {
  type Feature,
  type AuthenticationData,
  type Role,
  type DiscoveryData,
  type Entity,
  type RestEndpoint,
  type GraphQLAPI,
} from "./PhaseVisualization";

import {
  type Mode,
  type ChatMessage,
  cx,
  makeId,
  stripMarkdown,
  copyToClipboard,
  STUDIO_GRAPHQL_URL,
  getGqlErrors,
  getGqlData,
  CREATE_CONVERSATION_MUTATION,
  GET_PHASE_MUTATION,
  CONTINUE_CONVERSATION_V2_MUTATION,
} from "./studio.types.ts";

function usePersistentNumber(key: string, initial: number) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// -------------- Typewriter Component ----------------

const TypewriterEffect = ({
  content,
  onComplete,
}: {
  content: string;
  onComplete?: () => void;
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const cleanContent = stripMarkdown(content);
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayedContent("");
  }, [cleanContent]);

  useEffect(() => {
    const animInterval = setInterval(() => {
      if (index.current < cleanContent.length) {
        const chunk = cleanContent.slice(index.current, index.current + 2);
        setDisplayedContent((prev) => prev + chunk);
        index.current += 2;
      } else {
        clearInterval(animInterval);
        if (onComplete) onComplete();
      }
    }, 15);

    return () => clearInterval(animInterval);
  }, [cleanContent, onComplete]);

  return <span className="whitespace-pre-wrap leading-relaxed">{displayedContent}</span>;
};

// -------------- Auto-resize Textarea ----------------

function AutoResizeTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  inputRef,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}) {
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollH = textarea.scrollHeight;
      const maxH = 150;
      const newHeight = Math.min(scrollH, maxH);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
    }
  }, [value, inputRef]);

  return (
    <textarea
      ref={inputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full py-2.5 pl-4 pr-2 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm leading-relaxed"
      rows={1}
      style={{ minHeight: '40px', maxHeight: '150px' }}
      disabled={disabled}
      autoFocus
    />
  );
}


const PLACEHOLDER_PROMPTS = [
  "Ex: A social media app where users can share posts...",
  "Ex: An e-commerce platform with real-time inventory...",
  "Ex: A project management tool with team collaboration...",
  "Ex: A fitness tracking app with personalized workouts...",
];

function useRotatingPlaceholder() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return PLACEHOLDER_PROMPTS[index];
}

// -------------- Thinking Timer Component ----------------

function ThinkingTimer({ startTime }: { startTime: number }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    setSeconds(elapsed);

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (seconds > 10) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Taking longer than expected, please wait...
      </span>
    );
  }

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      Thinking for {seconds} second{seconds !== 1 ? 's' : ''}...
    </span>
  );
}

// -------------- Data Summary Badge ----------------

function DataSummaryBadge({
  summary
}: {
  summary: ChatMessage['dataSummary']
}) {
  if (!summary) return null;

  const items: string[] = [];
  if (summary.entities && summary.entities > 0) {
    items.push(`${summary.entities} entit${summary.entities === 1 ? 'y' : 'ies'}`);
  }
  if (summary.restEndpoints && summary.restEndpoints > 0) {
    items.push(`${summary.restEndpoints} REST endpoint${summary.restEndpoints === 1 ? '' : 's'}`);
  }
  if (summary.graphqlQueries && summary.graphqlQueries > 0) {
    items.push(`${summary.graphqlQueries} GraphQL quer${summary.graphqlQueries === 1 ? 'y' : 'ies'}`);
  }
  if (summary.graphqlMutations && summary.graphqlMutations > 0) {
    items.push(`${summary.graphqlMutations} GraphQL mutation${summary.graphqlMutations === 1 ? '' : 's'}`);
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
        >
          <Check size={10} />
          {item} added to Visual Cards
        </span>
      ))}
    </div>
  );
}

// -------------- Visualization Loader Component ----------------

function VisualizationLoader() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-12 min-h-[400px]">
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        <img
          src="/logo1.png"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="text-center mb-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Building Your Blueprint
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mx-auto">
          Generating project visualization...
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 opacity-40">
        <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse" />
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse w-5/6" />
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse w-4/6" />
      </div>
    </div>
  );
}

// -------------- Mode Tab Button ----------------

function ModeTabButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled = false,
  customIcon,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  label: string;
  disabled?: boolean;
  customIcon?: React.ReactNode;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cx(
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
        disabled
          ? "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
          : active
            ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      {customIcon ? customIcon : Icon && <Icon size={14} />}
      <span>{label}</span>
      {disabled && <Lock size={10} className="ml-0.5 opacity-50" />}
    </button>
  );
}

// -------------- Error Actions Component ----------------

function ErrorActions({
  onRegenerate,
  onFeedback,
}: {
  onRegenerate: () => void;
  onFeedback: () => void;
}) {
  return (
    <div className="mt-2">
      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
        Something went wrong on our side. Please try one of these options:
      </p>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <RotateCcw size={12} />
          Regenerate
        </button>
        <button
          onClick={onFeedback}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <MessageCircle size={12} />
          Feedback
        </button>
      </div>
    </div>
  );
}

// -------------- Main component ----------------------

export default function FarclStudioV2() {
  const { isLoading: orgLoading } = useOrg();
  const { selectedWorkspaceId } = useWorkspace();
  const { selectedProjectId } = useProject();
  const authUser = useAuthStore(selectUser);

  const userNameFromAuth = authUser?.name;
  const storedName = useUserDisplayStore((s) => s.displayName);
  const setStoredName = useUserDisplayStore((s) => s.setDisplayName);

  useEffect(() => {
    const trimmed = userNameFromAuth?.trim();
    if (trimmed && trimmed !== storedName) {
      setStoredName(trimmed);
    }
  }, [userNameFromAuth, storedName, setStoredName]);

  const displayName =
    (storedName && storedName.trim()) ||
    (userNameFromAuth && userNameFromAuth.trim()) ||
    "there";

  const hasWorkspaceSelected = !!selectedWorkspaceId;
  const hasProjectSelected = !!selectedProjectId;

  const [mode, setMode] = useState<Mode>("chat");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [leftWidth, setLeftWidth] = usePersistentNumber(
    "farcl_studio_v2_split_left_px",
    700
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [backendPhase, setBackendPhase] = useState<string | null>(null);
  const [isInitialInPhase, setIsInitialInPhase] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);

  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [authData, setAuthData] = useState<AuthenticationData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [apiStyle, setApiStyle] = useState<string | null>(null);
  const [restEndpoints, setRestEndpoints] = useState<RestEndpoint[]>([]);
  const [graphqlAPI, setGraphqlAPI] = useState<GraphQLAPI | null>(null);

  const [isTransitioningPhase, setIsTransitioningPhase] = useState(false);
  const [isLoadingVisualization, setIsLoadingVisualization] = useState(false);

  const heroPlaceholder = useRotatingPlaceholder();

  const showSplitView = features.length > 0;
  const showCenteredHero = messages.length === 0 && !messageLoading;
  const shouldShowCenteredView = !showSplitView;
  const shouldShowModeTabs = showSplitView;
  const conversationNotReady = creatingConversation || !conversationId || !backendPhase;

  const safeSetLeftWidth = (next: number) => {
    const el = containerRef.current;
    if (!el) return setLeftWidth(next);
    const total = el.getBoundingClientRect().width;
    const minLeft = total * 0.35;
    const maxLeft = total * 0.65;
    setLeftWidth(Math.max(minLeft, Math.min(maxLeft, next)));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const el = containerRef.current;
      if (!el) return;
      const x = e.clientX - el.getBoundingClientRect().left;
      safeSetLeftWidth(x);
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    if (mode !== "chat") return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messageLoading, isTransitioningPhase]);

  const resetConversation = () => {
    setConversationId(null);
    setBackendPhase(null);
    setIsInitialInPhase(true);
    setMessages([]);
    setApiError(null);
    setLastPrompt(null);
    setIsTransitioningPhase(false);
    setDiscoveryData(null);
    setFeatures([]);
    setAuthData(null);
    setRoles([]);
    setEntities([]);
    setApiStyle(null);
    setRestEndpoints([]);
    setGraphqlAPI(null);
    setIsLoadingVisualization(false);
    setThinkingStartTime(null);
  };

  const safeParse = (str: any) => {
    if (typeof str !== 'string') return str;
    try { return JSON.parse(str); } catch { return str; }
  };

  const fetchPhase = async (token: string, convId: string): Promise<string | null> => {
    try {
      const res = await fetch(STUDIO_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: GET_PHASE_MUTATION,
          variables: { conversationId: convId },
        }),
      });
      const json = await res.json();
      if (getGqlErrors(json)?.length) throw new Error(getGqlErrors(json)[0]?.message);
      const data = getGqlData(json);
      let phaseData = data?.getPhase;
      if (typeof phaseData === "string") {
        try { phaseData = JSON.parse(phaseData); } catch { }
      }
      return phaseData?.next ?? null;
    } catch (e) {
      console.error("Failed to fetch phase", e);
      return null;
    }
  };

  const processV2Response = (content: any): ChatMessage['dataSummary'] => {
    if (!content) return undefined;

    const summary: ChatMessage['dataSummary'] = {};

    if (content.project_name || content.core_problem || content.target_users) {
      setDiscoveryData(prev => ({
        ...prev,
        project_name: content.project_name || prev?.project_name,
        core_problem: content.core_problem || prev?.core_problem,
        target_users: content.target_users || prev?.target_users,
      }));
    }

    if (content.features && Array.isArray(content.features) && content.features.length > 0) {
      setFeatures(content.features);
    }

    if (content.auth_required !== undefined || content.mfa_required !== undefined || content.methods) {
      setAuthData({
        auth_required: content.auth_required ?? false,
        mfa_required: content.mfa_required ?? false,
        methods: content.methods || [],
      });
    }

    if (content.roles && Array.isArray(content.roles) && content.roles.length > 0) {
      setRoles(content.roles);
    }

    if (content.entities && Array.isArray(content.entities) && content.entities.length > 0) {
      setEntities(content.entities);
      summary.entities = content.entities.length;
    }

    if (content.api_style) {
      setApiStyle(content.api_style);
    }

    if (content.rest && Array.isArray(content.rest) && content.rest.length > 0) {
      setRestEndpoints(content.rest);
      summary.restEndpoints = content.rest.length;
    }

    if (content.graphql) {
      setGraphqlAPI(content.graphql);
      if (content.graphql.queries) {
        summary.graphqlQueries = content.graphql.queries.length;
      }
      if (content.graphql.mutations) {
        summary.graphqlMutations = content.graphql.mutations.length;
      }
    }

    const hasSummary = summary.entities || summary.restEndpoints || summary.graphqlQueries || summary.graphqlMutations;
    return hasSummary ? summary : undefined;
  };

  const callContinueConversationV2 = async (
    token: string,
    convId: string,
    message: string,
    isInitial: boolean,
    phase: string
  ) => {
    const res = await fetch(STUDIO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: CONTINUE_CONVERSATION_V2_MUTATION,
        variables: {
          conversationId: convId,
          message,
          isInitialConversation: isInitial,
          phase,
          version: "V2",
        },
      }),
    });
    const json = await res.json();
    if (getGqlErrors(json)?.length) throw new Error(getGqlErrors(json)[0]?.message);
    return getGqlData(json)?.continueCoversationV2;
  };

  const getThinkingDuration = (startTime?: number | null): number => {
    const t = startTime ?? thinkingStartTime;
    if (t) {
      return Math.round((Date.now() - t) / 1000);
    }
    return 0;
  };

  const startNewPhase = async (token: string, convId: string, phase: string) => {
    const phaseStartTime = Date.now();
    setThinkingStartTime(phaseStartTime);
    try {
      const response = await callContinueConversationV2(token, convId, "", true, phase);

      let content = response?.content;
      if (typeof content === "string") {
        content = safeParse(content);
      }

      const duration = getThinkingDuration(phaseStartTime);

      if (content && typeof content === "object" && content.message) {
        const dataSummary = processV2Response(content);

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: content.message,
            createdAt: Date.now(),
            isAnimated: false,
            thinkingDuration: duration,
            dataSummary,
          },
        ]);
        setIsInitialInPhase(false);
      } else if (typeof content === "string" && content.trim().toUpperCase() !== "END") {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: content,
            createdAt: Date.now(),
            isAnimated: false,
            thinkingDuration: duration,
          },
        ]);
        setIsInitialInPhase(false);
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error starting phase");
    } finally {
      setIsTransitioningPhase(false);
      setIsLoadingVisualization(false);
      setThinkingStartTime(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    if (!hasWorkspaceSelected || !hasProjectSelected) {
      resetConversation();
      return;
    }
    if (conversationId || creatingConversation || apiError) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return setApiError("Not authenticated");

    setCreatingConversation(true);
    (async () => {
      try {
        const res = await fetch(STUDIO_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: CREATE_CONVERSATION_MUTATION,
            variables: { projectId: selectedProjectId, workspaceId: selectedWorkspaceId },
          }),
        });
        const json = await res.json();
        if (getGqlErrors(json)?.length) throw new Error(getGqlErrors(json)[0]?.message);

        let conv: any = getGqlData(json)?.createCoversation;
        if (typeof conv === "string") try { conv = JSON.parse(conv); } catch { }
        if (!conv?.id) throw new Error("No conversation ID");

        setConversationId(conv.id);
        const phase = await fetchPhase(token, conv.id);
        const initialPhase = phase ?? "DISCOVERY";
        setBackendPhase(initialPhase);
        setIsInitialInPhase(true);
      } catch (e) {
        setApiError(e instanceof Error ? e.message : "Creation failed");
      } finally {
        setCreatingConversation(false);
      }
    })();
  }, [hasWorkspaceSelected, hasProjectSelected, conversationId, creatingConversation, apiError]);

  const onSend = async (overrideText?: string) => {
    const text = overrideText ?? input.trim();
    if (!text || !conversationId || !backendPhase) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setApiError(null);
    setLastPrompt(text);

    const requestStartTime = Date.now();
    setThinkingStartTime(requestStartTime);

    if (!overrideText) {
      setMessages((prev) => [...prev, { id: makeId(), role: "user", content: text, createdAt: Date.now() }]);
      setInput("");
    }

    setMessageLoading(true);

    setTimeout(() => inputRef.current?.focus(), 0);

    try {
      const response = await callContinueConversationV2(
        token,
        conversationId,
        text,
        isInitialInPhase,
        backendPhase
      );

      let content = response?.content;
      if (typeof content === "string") {
        content = safeParse(content);
      }

      const isEnd =
        (typeof content === "string" && content.trim().toUpperCase() === "END") ||
        (typeof content === "object" && content === "END");

      if (isEnd) {
        setMessageLoading(false);
        setIsTransitioningPhase(true);
        setIsLoadingVisualization(true);

        const nextPhase = await fetchPhase(token, conversationId);

        if (nextPhase) {
          setBackendPhase(nextPhase);
          setIsInitialInPhase(true);
          await startNewPhase(token, conversationId, nextPhase);
        } else {
          const duration = getThinkingDuration(requestStartTime);
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: "assistant",
              content: "Great! Your project configuration is complete. You can now proceed to build your application.",
              createdAt: Date.now(),
              isAnimated: false,
              thinkingDuration: duration,
            },
          ]);
          setIsTransitioningPhase(false);
          setIsLoadingVisualization(false);
          setThinkingStartTime(null);
        }
      } else if (content && typeof content === "object" && content.message) {
        const duration = getThinkingDuration(requestStartTime);
        const dataSummary = processV2Response(content);

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: content.message,
            createdAt: Date.now(),
            isAnimated: false,
            thinkingDuration: duration,
            dataSummary,
          },
        ]);
        setIsInitialInPhase(false);
        setMessageLoading(false);
        setThinkingStartTime(null);
      } else if (typeof content === "string") {
        const duration = getThinkingDuration(requestStartTime);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: content,
            createdAt: Date.now(),
            isAnimated: false,
            thinkingDuration: duration,
          },
        ]);
        setIsInitialInPhase(false);
        setMessageLoading(false);
        setThinkingStartTime(null);
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error sending message");
      setMessageLoading(false);
      setThinkingStartTime(null);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRegenerate = () => {
    if (lastPrompt) {
      setApiError(null);
      onSend(lastPrompt);
    }
  };

  const handleFeedback = () => {
    console.log("Feedback clicked");
  };

  const copyMsg = async (m: ChatMessage) => {
    await copyToClipboard(m.content);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId((cur) => (cur === m.id ? null : cur)), 1500);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const markMessageAnimated = (id: string) => {
    setMessages((prev) => prev.map(m => m.id === id ? { ...m, isAnimated: true } : m));
  };

  const getChatWidth = () => {
    if (shouldShowCenteredView) return "100%";
    return `${leftWidth}px`;
  };

  return (
    <div className="min-h-screen h-screen text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      <style>{`
        .chat-section {
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                      max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      margin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .right-pane {
          transition: opacity 0.5s ease-in-out, 
                      transform 0.5s ease-in-out,
                      flex 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .divider {
          transition: opacity 0.4s ease-in-out, 
                      width 0.4s ease-in-out;
        }
        .input-container {
          border: 1px solid rgb(229, 231, 235);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dark .input-container {
          border-color: rgb(55, 65, 81);
        }
        .input-container:focus-within {
          border-color: rgb(147, 197, 253);
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.15);
        }
        .dark .input-container:focus-within {
          border-color: rgb(96, 165, 250);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
        }
      `}</style>

      {orgLoading ? <HeaderSkeleton /> : <Header />}

      <div className="flex-1 flex overflow-hidden bg-white dark:bg-gray-900">
        {conversationNotReady ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-[2.5px] border-gray-200 dark:border-gray-700 border-t-sky-400 border-r-blue-500 animate-spin" />
              <p className="text-xs text-gray-400 dark:text-gray-500">Initializing...</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="flex-1 min-w-0 h-full flex relative">
            {/* LEFT PANE - CHAT SECTION */}
            <section
              className={cx(
                "chat-section flex flex-col relative bg-white dark:bg-gray-900 h-full",
                shouldShowCenteredView && "mx-auto"
              )}
              style={{
                width: getChatWidth(),
                maxWidth: shouldShowCenteredView ? "900px" : "none",
                flexShrink: shouldShowCenteredView ? 1 : 0
              }}
            >
              {/* Mode Tabs */}
              {shouldShowModeTabs && (
                <div className="absolute z-10 top-4 left-4">
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                    <ModeTabButton
                      active={mode === 'chat'}
                      onClick={() => setMode('chat')}
                      icon={MessageSquare}
                      label="Chat"
                    />
                    <ModeTabButton
                      active={mode === 'database'}
                      onClick={() => setMode('database')}
                      icon={DatabaseIcon}
                      label="Database"
                      disabled={true}
                    />
                    <ModeTabButton
                      active={mode === 'editor'}
                      onClick={() => setMode('editor')}
                      label="Editor"
                      disabled={true}
                      customIcon={<FileCode size={14} />}
                    />
                  </div>
                </div>
              )}

              {mode === "chat" ? (
                showCenteredHero ? (
                  <div className="flex-1 flex flex-col items-center justify-center px-4">

                    <div className="max-w-xl text-center">
                      <div className="w-24 h-24 mx-auto mb-1">
                        <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Hello {displayName}, what do you want to build?
                      </h1>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Describe your idea and I'll help you plan it out.
                      </p>
                    </div>

                    <div className="mt-8 w-full max-w-xl">
                      <div className="input-container flex items-end gap-2 w-full p-1 bg-white dark:bg-gray-800 rounded-2xl">
                        <AutoResizeTextarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                          placeholder={heroPlaceholder}
                          disabled={messageLoading || isTransitioningPhase}
                          inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                        />
                        <button
                          onClick={() => onSend()}
                          disabled={!input.trim() || messageLoading || isTransitioningPhase}
                          className={cx(
                            "shrink-0 p-2.5 mb-0.5 mr-0.5 rounded-xl transition-colors",
                            input.trim() && !messageLoading && !isTransitioningPhase
                              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      {apiError && (
                        <div className="mt-2">
                          <div className="text-red-500 text-xs text-center">{apiError}</div>
                          <ErrorActions onRegenerate={handleRegenerate} onFeedback={handleFeedback} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={cx(
                      "flex-1 overflow-y-auto p-4 scroll-smooth",
                      shouldShowModeTabs ? "pt-16" : "pt-4"
                    )}>
                      <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-4">
                        {messages.map((m, idx) => {
                          const isUser = m.role === "user";
                          const isLast = idx === messages.length - 1;
                          const shouldAnimate = m.role === "assistant" && isLast && !m.isAnimated;
                          // Show thinking time for assistant messages that have a recorded duration

                          const showThinkingTime = !isUser && m.thinkingDuration !== undefined && m.thinkingDuration > 0;

                          return (
                            <div key={m.id} className={cx("flex gap-3 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
                              {isUser ? (
                                <AppAvatar
                                  src={authUser?.profileImage}
                                  alt={authUser?.name || "You"}
                                  size="sm"
                                  className="shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                                  <Bot size={16} />
                                </div>
                              )}

                              <div className={cx("flex flex-col max-w-[85%]", isUser && "items-end")}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {isUser ? "You" : "Assistant"}
                                  </span>
                                  {showThinkingTime && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      · Thought for {m.thinkingDuration}s
                                    </span>
                                  )}
                                </div>
                                <div className={cx(
                                  "text-sm leading-relaxed",
                                  isUser
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-tr-sm"
                                    : "text-gray-700 dark:text-gray-300 px-1"
                                )}>
                                  {shouldAnimate ? (
                                    <TypewriterEffect content={m.content} onComplete={() => markMessageAnimated(m.id)} />
                                  ) : (
                                    <span className="whitespace-pre-wrap">{stripMarkdown(m.content)}</span>
                                  )}
                                </div>

                                {/* Data Summary Badge */}

                                {!isUser && m.dataSummary && (
                                  <DataSummaryBadge summary={m.dataSummary} />
                                )}

                                {!isUser && (
                                  <div className="flex items-center gap-2 mt-1.5 px-1">
                                    <button onClick={() => copyMsg(m)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1" title="Copy">
                                      {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Loading state - only show thinking timer, no dots */}
                        {messageLoading && !isTransitioningPhase && thinkingStartTime && (
                          <div className="flex gap-3 w-full">
                            <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                              <Bot size={16} />
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                              <ThinkingTimer startTime={thinkingStartTime} />
                              <div className="flex items-center gap-1">

                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />

                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />

                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />

                              </div>

                            </div>
                          </div>
                        )}

                        {/* Phase transition state - only show thinking timer, no dots */}
                        {isTransitioningPhase && thinkingStartTime && (
                          <div className="flex gap-3 w-full">
                            <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-white shadow-sm bg-gradient-to-br from-sky-400 to-blue-500">
                              <Bot size={16} />
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                              <ThinkingTimer startTime={thinkingStartTime} />
                              <div className="flex items-center gap-1">

                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />

                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />

                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />

                              </div>

                            </div>
                          </div>
                        )}

                        <div ref={endRef} />
                      </div>
                    </div>

                    <div className="shrink-0 p-4 bg-white dark:bg-gray-900">
                      <div className="max-w-2xl mx-auto">
                        {apiError && (
                          <div className="mt-1 mb-2">
                            <ErrorActions onRegenerate={handleRegenerate} onFeedback={handleFeedback} />
                          </div>
                        )}
                        <div className="input-container flex items-end gap-2 w-full p-1 bg-white dark:bg-gray-800 rounded-2xl">
                          <AutoResizeTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                            placeholder="Continue describing..."
                            disabled={messageLoading || isTransitioningPhase}
                            inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                          />
                          <button
                            onClick={() => onSend()}
                            disabled={!input.trim() || messageLoading || isTransitioningPhase}
                            className={cx(
                              "shrink-0 p-2 mb-0.5 mr-0.5 rounded-xl transition-colors",
                              input.trim() && !messageLoading && !isTransitioningPhase
                                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            <Send size={16} />
                          </button>
                        </div>


                      </div>
                    </div>
                  </>
                )
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Lock size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Coming Soon</p>
                  </div>
                </div>
              )}
            </section>

            {/* DIVIDER */}
            <div
              className={cx(
                "divider relative group cursor-col-resize bg-gray-200 dark:bg-black-800 z-30",
                shouldShowCenteredView
                  ? "opacity-0 w-0 pointer-events-none"
                  : "opacity-100 w-px hover:w-2 bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-700"
              )}
              onMouseDown={() => {
                if (!shouldShowCenteredView) {
                  draggingRef.current = true;
                  document.body.style.cursor = "col-resize";
                  document.body.style.userSelect = "none";
                }
              }}
            />

            {/* RIGHT PANE */}
            <section
              className={cx(
                "right-pane min-w-0 h-full bg-gray-50 dark:bg-gray-900 overflow-hidden",
                shouldShowCenteredView
                  ? "flex-[0] opacity-0 translate-x-8"
                  : "flex-1 opacity-100 translate-x-0"
              )}
            >
              {isLoadingVisualization ? (
                <VisualizationLoader />
              ) : (
                <PhaseVisualizationV2
                  discoveryData={discoveryData}
                  features={features}
                  authData={authData}
                  roles={roles}
                  entities={entities}
                  apiStyle={apiStyle}
                  restEndpoints={restEndpoints}
                  graphqlAPI={graphqlAPI}
                  activePhase={backendPhase}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}