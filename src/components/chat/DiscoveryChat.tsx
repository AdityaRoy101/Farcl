import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { Header } from "../../components/Header/Header";
import { HeaderSkeleton } from "../../components/Skeleton/Skeleton";
import { useOrg } from "../../contexts/workspace";
import { useAuthStore, selectUser } from "../../stores/auth";
import { useUserDisplayStore } from "../../stores/auth/UserDisplay";

type Phase = "discovery" | "build";
type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function DiscoveryChat() {
  const authUser = useAuthStore(selectUser);
  const userNameFromAuth = authUser?.name;

  // IMPORTANT: call zustand store separately for each value
  const storedName = useUserDisplayStore((s) => s.displayName);
  const setStoredName = useUserDisplayStore((s) => s.setDisplayName);

  // Persist a good name once we have it from auth
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

  const [phase, setPhase] = useState<Phase>("discovery");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, phase]);

  const onSend = () => {
    const text = input.trim();
    if (!text) return;

    const msg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const finishDiscovery = () => {
    if (phase === "discovery" && messages.length > 0) {
      setPhase("build");
    }
  };

  const renderMessages = () => {
    if (messages.length === 0 && phase === "discovery") {
      return null;
    }

    return (
      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cx(
              "max-w-2xl",
              m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"
            )}
          >
            <div className="text-[11px] text-gray-500 mb-1">
              {m.role === "user" ? "You" : "Assistant"} · {formatTime(m.createdAt)}
            </div>
            <div
              className={cx(
                "inline-block rounded-2xl px-3 py-2 text-sm shadow-sm border",
                m.role === "user"
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-white text-gray-900 border-gray-200"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    );
  };

  const showCenteredHero = phase === "discovery" && messages.length === 0;

  return (
    <div
      className="h-[calc(100vh-65px)] w-full flex"
      style={{
        background: `linear-gradient(
          to right,
          rgb(255, 255, 255) 0%,
          rgb(255, 255, 255) 10%,
          rgb(221 231 232) 18%,
          rgb(212 232 248) 25%,
          rgb(224, 247, 250) 40%,
          rgb(255, 255, 255) 65%,
          rgb(255, 255, 255) 100%
        )`,
      }}
    >
      {phase === "build" ? (
        // Build phase: split view (chat left, editor right)
        <div className="flex-1 flex min-w-0">
          {/* Left: chat */}
          <section className="w-1/2 min-w-[420px] max-w-[720px] h-full flex flex-col border-r border-cyan-300 bg-white/80 backdrop-blur-sm">
            {/* Small header */}
            <div className="h-14 px-5 flex items-center justify-between border-b border-cyan-200/70 bg-white/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-400/15 border border-cyan-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Discovery Chat</div>
                  <div className="text-xs text-gray-500">
                    Build context is now locked in
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
              {renderMessages()}
            </div>

            {/* Input at bottom */}
            <div className="px-5 py-4 border-t border-cyan-200/60 bg-white/90">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend();
                  }}
                  placeholder="Ask a follow-up or refine your idea..."
                  className="flex-1 h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={onSend}
                  className="h-11 w-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Right: editor placeholder */}
          <section className="flex-1 min-w-0 h-full bg-white/60 backdrop-blur-sm">
            <div className="h-full p-6 flex flex-col min-h-0">
              <div className="text-lg font-semibold text-gray-900">Build Space</div>
              <div className="mt-2 text-sm text-gray-500">
                Code editor & previews will appear here based on the discovery summary.
              </div>

              <div className="mt-5 flex-1 min-h-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm flex items-start">
                <span className="text-sm text-gray-500 font-mono">
                  Editor coming soon... (Monaco or your chosen editor can be integrated here)
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : (
        // Discovery phase: full-width chat
        <div className="flex-1 flex flex-col min-w-0 bg-white/70 backdrop-blur-sm border-l border-cyan-200/40">
          {/* Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-cyan-200/60 bg-white/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-400/15 border border-cyan-200 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Discovery Chat</div>
                <div className="text-xs text-gray-500">
                  Tell me what you want to build — we’ll refine it together.
                </div>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={finishDiscovery}
                className="h-9 px-3 rounded-xl border border-blue-500/30 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 shadow-sm"
              >
                Finish discovery (mock) →
              </button>
            )}
          </div>

          {/* Body */}
          {showCenteredHero ? (
            // Centered greeting + input (before first message)
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="max-w-xl text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Hello {displayName}, what do you want to build?
                </h1>
                <p className="mt-3 text-sm text-gray-600">
                  Describe your idea in natural language. I’ll help you refine requirements and
                  prepare everything we need before coding.
                </p>
              </div>

              <div className="mt-8 w-full max-w-xl">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSend();
                    }}
                    placeholder="Ex: A dashboard to monitor deployments across all workspaces..."
                    className="flex-1 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Standard chat layout with input at bottom
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
                {/* Small greeting at top */}
                <div className="max-w-2xl text-left text-sm text-gray-500">
                  Hello <span className="font-semibold text-gray-800">{displayName}</span>, let’s
                  clarify what you want to build.
                </div>
                {renderMessages()}
              </div>

              <div className="px-6 py-4 border-t border-cyan-200/60 bg-white/90">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSend();
                    }}
                    placeholder="Continue describing your idea..."
                    className="flex-1 h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    className="h-11 w-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiscoveryChatPage() {
  const { isLoading } = useOrg();

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? <HeaderSkeleton /> : <Header />}
      <DiscoveryChat />
    </div>
  );
}