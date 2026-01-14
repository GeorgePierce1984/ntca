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
  X,
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
  readAt?: string | null;
  createdAt: string;
}

interface ProcessedMessage {
  id: string;
  senderId: string;
  senderType: "SCHOOL" | "TEACHER";
  content: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
  isPlaceholder?: boolean;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({ isOpen, onClose, onUnreadCountChange }) => {
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
      const conversationsList = data.conversations || [];
      setConversations(conversationsList);
      
      // Calculate and notify total unread count
      const totalUnread = conversationsList.reduce(
        (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0),
        0
      );
      if (onUnreadCountChange) {
        onUnreadCountChange(totalUnread);
      }
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

      // Mark messages as read and wait for it to complete
      const markReadResponse = await fetch(`/api/messages/${conversationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!markReadResponse.ok) {
        console.error("Error marking messages as read:", await markReadResponse.text());
      }

      // Small delay to ensure database update is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh conversations to get updated unread counts from server
      // This ensures the count is accurate and syncs with the dashboard
      const conversationsResponse = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        const updatedConversations = conversationsData.conversations || [];
        setConversations(updatedConversations);
        
        // Calculate and notify total unread count
        const totalUnread = updatedConversations.reduce(
          (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0),
          0
        );
        if (onUnreadCountChange) {
          onUnreadCountChange(totalUnread);
        }
      } else {
        // Fallback: update local state if refresh fails
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
        // Calculate new total from updated local state
        const updatedLocal = conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        );
        const totalUnread = updatedLocal.reduce(
          (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0),
          0
        );
        if (onUnreadCountChange) {
          onUnreadCountChange(totalUnread);
        }
      }
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

  // Fetch messages when conversation is selected or modal opens
  // Only refresh when user switches back to the tab (not on intervals)
  useEffect(() => {
    if (selectedConversation && isOpen) {
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
  }, [selectedConversation, isOpen]);

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    } else {
      // When modal closes, refresh count one more time to ensure it's up to date
      if (onUnreadCountChange) {
        fetch("/api/messages/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            const totalUnread = (data.conversations || []).reduce(
              (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0),
              0
            );
            onUnreadCountChange(totalUnread);
          })
          .catch((err) => {
            console.error("Error refreshing unread count:", err);
          });
      }
    }
  }, [isOpen]);

  // Check for conversation ID in URL params and auto-select it
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && !loading && conversations.length > 0 && isOpen) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && selectedConversation !== conversationId) {
        setSelectedConversation(conversationId);
        fetchMessages(conversationId);
        setSearchParams({});
      }
    }
  }, [conversations, searchParams, loading, isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedConversation && isOpen) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, selectedConversation, isOpen]);

  // Check if a message should be replaced with placeholder
  const shouldDisappear = (message: Message): boolean => {
    if (!message.read) return false;
    
    // Use readAt if available, otherwise use createdAt (for messages read before readAt was tracked)
    const readDate = message.readAt ? new Date(message.readAt) : new Date(message.createdAt);
    const now = new Date();
    const daysSinceRead = (now.getTime() - readDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceRead > 3;
  };

  // Process messages to replace old read messages with placeholders
  const processMessages = (messages: Message[]): ProcessedMessage[] => {
    const processed: ProcessedMessage[] = [];
    let inDisappearingGroup = false;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      if (shouldDisappear(message)) {
        // If we're not already in a disappearing group, add a placeholder
        if (!inDisappearingGroup) {
          processed.push({
            id: `placeholder-${i}-${Date.now()}`,
            senderId: "",
            senderType: message.senderType,
            content: "Disappearing messages, messages will disappear from this chat after 3 days",
            read: true,
            createdAt: message.createdAt,
            isPlaceholder: true,
          });
          inDisappearingGroup = true;
        }
        // Skip adding the actual disappearing message
      } else {
        // Add the message and reset the disappearing group flag
        processed.push(message);
        inDisappearingGroup = false;
      }
    }

    return processed;
  };

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

  // Get processed messages for display
  const processedMessages = processMessages(messages);

  if (!isOpen) return null;

  const isBlocked = user?.userType === "SCHOOL" && !canAccessPremiumFeatures(subscriptionStatus);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop with 100% transparency */}
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Modal Content */}
        <Paywall
          isBlocked={isBlocked}
          featureName="Message Center"
          description="Subscribe to unlock messaging functionality and communicate with applicants."
        >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[65%] h-[65%] max-w-4xl max-h-[59vh] m-4 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="heading-3">Message Center</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="w-5 h-5" />}
            >
              Close
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
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
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
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
                    {processedMessages.map((message) => {
                      const isOwnMessage =
                        message.senderType === user?.userType;
                      const isPlaceholder = message.isPlaceholder;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isPlaceholder
                                ? "bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                                : isOwnMessage
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            }`}
                          >
                            <p className={`text-sm ${isPlaceholder ? "italic" : ""}`}>
                              {message.content}
                            </p>
                            {!isPlaceholder && (
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage
                                    ? "text-primary-100"
                                    : "text-neutral-500"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            )}
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
          </div>
        </motion.div>
        </Paywall>
      </motion.div>
    </AnimatePresence>
  );
};

