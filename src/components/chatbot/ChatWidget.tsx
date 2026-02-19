import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; content: string };

async function callChatApi(input: string, history: ChatMsg[]) {
  // IMPORTANT: don’t call OpenAI directly from frontend (you’d expose keys).
  // Make a backend endpoint like POST /api/chat that talks to the AI model.
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, history }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Chat request failed (${res.status})`);
  }

  const data = (await res.json()) as { reply?: string };
  return data.reply ?? "No reply from server.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! Ask me anything about Farcl." },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setInput("");
    setSending(true);

    const nextHistory = [...messages, { role: "user", content: text }] as ChatMsg[];
    setMessages(nextHistory);

    try {
      const reply = await callChatApi(text, nextHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry—something went wrong. Try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[200]">
      {open ? (
        <div className="w-[360px] max-w-[calc(100vw-40px)] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="font-semibold text-gray-900">Assistant</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[340px] overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-gray-900 text-white"
                      : "max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white border border-gray-200 text-gray-900"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {error ? (
            <div className="px-4 py-2 text-xs text-red-600 bg-white border-t border-gray-100">
              {error}
            </div>
          ) : null}

          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
              placeholder="Type a message…"
              className="flex-1 h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={sending}
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className="h-10 w-10 rounded-xl bg-blue-600 text-white inline-flex items-center justify-center disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 w-12 rounded-2xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 inline-flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}