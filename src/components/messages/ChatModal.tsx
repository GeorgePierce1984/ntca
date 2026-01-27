import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Message {
  id: string;
  senderId: string;
  senderType: "SCHOOL" | "TEACHER";
  content: string;
  createdAt: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  title?: string | null;
  subtitle?: string | null;
}

function linkifyText(text: string): Array<string | { href: string; label: string }> {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts: Array<string | { href: string; label: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const start = match.index;
    const raw = match[0];
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    parts.push({ href, label: raw });
    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  title,
  subtitle,
}) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canUseChat = Boolean(token && conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load messages");
      }
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);

      // Mark as read (best-effort)
      fetch(`/api/messages/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    } catch (e) {
      console.error("ChatModal fetchMessages error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!token || !conversationId || !messageContent.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageContent }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setMessageContent("");
    } catch (e) {
      console.error("ChatModal sendMessage error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Load messages when opened
  useEffect(() => {
    if (isOpen && conversationId && token) {
      fetchMessages(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversationId, token]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) return;
    const t = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isOpen]);

  const renderedMessages = useMemo(() => {
    return messages.map((m) => {
      const isOwn = m.senderType === user?.userType;
      const parts = linkifyText(m.content || "");
      return { ...m, isOwn, parts };
    });
  }, [messages, user?.userType]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {title || "Chat"}
                  </div>
                  {subtitle ? (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {subtitle}
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!canUseChat ? (
                  <div className="text-center text-neutral-500 py-10">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    <p>Please log in to view messages.</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                ) : renderedMessages.length === 0 ? (
                  <div className="text-center text-neutral-500 py-10">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  renderedMessages.map((m) => (
                    <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          m.isOwn
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-200 dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {m.parts.map((p, idx) =>
                            typeof p === "string" ? (
                              <React.Fragment key={idx}>{p}</React.Fragment>
                            ) : (
                              <a
                                key={idx}
                                href={p.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={m.isOwn ? "underline text-white" : "underline text-primary-600 dark:text-primary-400"}
                              >
                                {p.label}
                              </a>
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="input flex-1"
                    disabled={!canUseChat || sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!canUseChat || !messageContent.trim() || sending}
                    leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


