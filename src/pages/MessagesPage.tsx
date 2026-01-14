import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  User,
  Building,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Paywall } from "@/components/paywall/Paywall";
import { canAccessPremiumFeatures } from "@/utils/subscription";
import toast from "react-hot-toast";

interface Conversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    logoUrl?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderType: "SCHOOL" | "TEACHER";
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: "SCHOOL" | "TEACHER";
  content: string;
  read: boolean;
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, selectedConversation]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) {
      toast.error("Please log in to view messages");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        }
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    if (!token) {
      toast.error("Please log in to view messages");
      return;
    }

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        }
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      const newMessages = data.messages || [];
      
      setMessages(newMessages);

      // Mark messages as read
      await fetch(`/api/messages/${conversationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => {
        console.error("Error marking messages as read:", err);
        // Don't show error toast for this, it's not critical
      });

      // Update unread count in conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation || !token) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/messages/conversations/${selectedConversation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        }
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setMessageContent("");
      // Scroll will happen automatically via useEffect when messages change

      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) =>
    conv.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current conversation details
  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  // Fetch messages when conversation is selected
  // Only refresh when user switches back to the tab (not on intervals)
  useEffect(() => {
    if (selectedConversation) {
      // Initial fetch
      fetchMessages(selectedConversation);
      fetchConversations();
      
      // Only fetch when user switches back to the tab
      const handleVisibilityChange = () => {
        if (!document.hidden && selectedConversation) {
          // User switched back to the tab - refresh messages
          fetchMessages(selectedConversation);
          fetchConversations();
        }
      };
      
      // Listen for tab visibility changes
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [selectedConversation]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    if (!token || user?.userType !== "SCHOOL") return;
    
    try {
      const response = await fetch("/api/subscription-details", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.subscriptionStatus);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchSubscriptionStatus();
  }, []);

  // Check for conversation ID in URL params and auto-select it
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && !loading && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && selectedConversation !== conversationId) {
        setSelectedConversation(conversationId);
        fetchMessages(conversationId);
        // Remove the query param after selecting
        setSearchParams({});
      } else if (!conversation) {
        // Conversation not found in list, refresh conversations after a short delay
        // This handles the case where conversation was just created
        setTimeout(() => {
          fetchConversations();
        }, 500);
      }
    } else if (conversationId && !loading && conversations.length === 0) {
      // If we have a conversation ID but no conversations loaded, refresh
      setTimeout(() => {
        fetchConversations();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, searchParams, loading]);

  // Auto-scroll to bottom when messages change or conversation changes
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      // Use a slightly longer timeout to ensure DOM has fully updated
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, selectedConversation]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[90px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isBlocked = user?.userType === "SCHOOL" && !canAccessPremiumFeatures(subscriptionStatus);

  return (
    <Paywall
      isBlocked={isBlocked}
      featureName="Message Center"
      description="Subscribe to unlock messaging functionality and communicate with applicants."
    >
      <div className="min-h-screen pt-[90px] bg-neutral-50 dark:bg-neutral-900">
        <div className="container-custom max-w-7xl mx-auto px-4 py-8">
          <div className="card p-0 overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="heading-3 mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`p-4 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                        selectedConversation === conversation.id
                          ? "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {conversation.otherParty.photoUrl ||
                          conversation.otherParty.logoUrl ? (
                            <img
                              src={
                                conversation.otherParty.photoUrl ||
                                conversation.otherParty.logoUrl
                              }
                              alt={conversation.otherParty.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : user?.userType === "SCHOOL" ? (
                            <User className="w-6 h-6" />
                          ) : (
                            <Building className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.otherParty.name}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            {formatTime(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="hidden md:flex flex-1 flex-col">
              {selectedConversation && currentConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {currentConversation.otherParty.photoUrl ||
                        currentConversation.otherParty.logoUrl ? (
                          <img
                            src={
                              currentConversation.otherParty.photoUrl ||
                              currentConversation.otherParty.logoUrl
                            }
                            alt={currentConversation.otherParty.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : user?.userType === "SCHOOL" ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <Building className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {currentConversation.otherParty.name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {currentConversation.otherParty.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage =
                        message.senderType === user?.userType;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage
                                  ? "text-primary-100"
                                  : "text-neutral-500"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="input flex-1"
                        disabled={sending}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!messageContent.trim() || sending}
                        leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Message View */}
            {selectedConversation && currentConversation && (
              <div className="md:hidden fixed inset-0 bg-white dark:bg-neutral-900 z-50 flex flex-col pt-[90px]">
                {/* Mobile Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => setSelectedConversation(null)}
                  >
                    Back
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {currentConversation.otherParty.photoUrl ||
                    currentConversation.otherParty.logoUrl ? (
                      <img
                        src={
                          currentConversation.otherParty.photoUrl ||
                          currentConversation.otherParty.logoUrl
                        }
                        alt={currentConversation.otherParty.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : user?.userType === "SCHOOL" ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Building className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {currentConversation.otherParty.name}
                    </h3>
                  </div>
                </div>

                {/* Mobile Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderType === user?.userType;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? "bg-primary-600 text-white"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage
                                ? "text-primary-100"
                                : "text-neutral-500"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mobile Input */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="input flex-1"
                      disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageContent.trim() || sending}
                      leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Paywall>
  );
};


