import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import EmojiPicker from "../components/EmojiPicker";
import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
  X,
  MessageCircle,
  Smile,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../services/socket.service";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE";
  imageUrl?: string;
  createdAt: Date;
  read: boolean;
  delivered: boolean;
}

interface ChatUser {
  id: string;
  participantId: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  unreadCount: number;
  lastActiveAt?: string;
}

const Chat = () => {
  const { t } = useTranslation();
  const { chatId } = useParams();
  const { user, token } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(
    chatId || null,
  );
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket
  useEffect(() => {
    if (token) {
      socketService.connect(token);

      socketService.on("new_message", (msg: any) => {
        if (msg.chatId === selectedChat) {
          setMessages((prev) => [
            ...prev,
            {
              ...msg,
              createdAt: new Date(msg.createdAt),
            },
          ]);
          // Mark as read immediately if chat is open
          socketService.emit("mark_read", {
            chatId: selectedChat,
            messageIds: [msg.id],
          });
        }
        fetchChats();
      });

      socketService.on("message_sent", (msg: any) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.tempId ? { ...msg, tempId: undefined } : m,
          ),
        );
      });

      socketService.on("messages_read", ({ chatId, messageIds }: any) => {
        if (chatId === selectedChat) {
          setMessages((prev) =>
            prev.map((m) =>
              messageIds.includes(m.id) ? { ...m, read: true } : m,
            ),
          );
        }
      });

      socketService.on("user_online", () => fetchChats());
      socketService.on("user_offline", () => fetchChats());
    }

    return () => {
      socketService.disconnect();
    };
  }, [token, selectedChat]);

  // Fetch Chats
  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Transform API data to ChatUser interface
      const transformedChats: ChatUser[] = response.data.map((chat: any) => {
        const otherParticipant = chat.participants[0];
        return {
          id: chat.id,
          participantId: otherParticipant?.id || "",
          name: otherParticipant?.fullName || "Unknown User",
          avatar: otherParticipant?.avatar || "",
          online: false, // Updated via user_online/offline events or backend if implemented
          lastActiveAt: otherParticipant?.lastActiveAt,
          lastMessage: chat.messages[0]?.content || "No messages yet",
          unreadCount: 0,
        };
      });

      setChats(transformedChats);
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  };

  useEffect(() => {
    if (token) fetchChats();
  }, [token]);

  // Fetch Messages when chat selected
  useEffect(() => {
    if (selectedChat && token) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/chats/${selectedChat}/messages`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setMessages(
            response.data.map((m: any) => ({
              ...m,
              createdAt: new Date(m.createdAt),
            })),
          );
          // Mark all as read
          const unreadIds = response.data
            .filter((m: any) => !m.read && m.senderId !== user?.id)
            .map((m: any) => m.id);
          if (unreadIds.length > 0) {
            socketService.emit("mark_read", {
              chatId: selectedChat,
              messageIds: unreadIds,
            });
          }
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, token, user?.id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedImage) || !selectedChat) return;

    const activeChatUser = chats.find((c) => c.id === selectedChat);
    if (!activeChatUser) return;

    let imageUrl = "";
    let type: "TEXT" | "IMAGE" = "TEXT";

    try {
      if (selectedImage) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", selectedImage);
        const uploadRes = await axios.post(
          `${API_BASE_URL}/chats/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        imageUrl = uploadRes.data.url;
        type = "IMAGE";
      }

      const tempId = Date.now().toString();
      const payload = {
        chatId: selectedChat,
        toUserId: activeChatUser.participantId,
        content: message,
        type,
        imageUrl,
        tempId,
      };

      socketService.emit("send_message", payload);

      // Optimistic update
      const newMessage: Message = {
        id: tempId,
        senderId: user?.id || "me",
        content: message,
        type,
        imageUrl,
        createdAt: new Date(),
        read: false,
        delivered: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsUploading(false);
    }
  };

  const activeChat = chats.find((c) => c.id === selectedChat);
  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Chat List */}
      <div
        className={`glass w-full border-r border-gray-200 dark:border-gray-700 md:w-96 ${selectedChat ? "hidden md:block" : "block"
          }`}
      >
        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder={t('search_conversations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 transition-all bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Chat List */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100% - 73px)" }}
        >
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full border-b border-gray-200 p-4 text-left transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${selectedChat === chat.id
                ? "bg-indigo-50 dark:bg-indigo-900/20"
                : ""
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={chat.avatar || `https://i.pravatar.cc/100?u=${chat.id}`}
                    alt={chat.name}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {chat.name}
                    </h3>
                    {chat.unreadCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {t('no_conversations_found')}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat && activeChat ? (
        <div className="flex flex-col flex-1">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 glass dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={activeChat.avatar || "https://via.placeholder.com/100"}
                alt={activeChat.name}
                className="object-cover w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeChat.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activeChat.online ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {t('online_now')}
                    </span>
                  ) : activeChat.lastActiveAt ? (
                    `${t('last_seen')} ${new Date(activeChat.lastActiveAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  ) : (
                    t('offline')
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex animate-fadeInUp ${msg.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.senderId === user?.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700"
                      }`}
                  >
                    {msg.type === "IMAGE" && msg.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={msg.imageUrl}
                          alt={t('attachment')}
                          className="max-h-60 w-auto rounded-lg object-cover cursor-pointer"
                          onClick={() => window.open(msg.imageUrl)}
                        />
                      </div>
                    )}

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content
                        .split(/(https?:\/\/[^\s]+)/g)
                        .map((part, i) =>
                          /(https?:\/\/[^\s]+)/g.test(part) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline break-all font-bold"
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          ),
                        )}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span
                        className={`text-[10px] ${msg.senderId === user?.id ? "text-white/70" : "text-gray-500"}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.senderId === user?.id && (
                        <div className="flex">
                          {msg.read ? (
                            <CheckCheck className="w-3 h-3 text-blue-300" />
                          ) : msg.delivered ? (
                            <CheckCheck className="w-3 h-3 text-white/50" />
                          ) : (
                            <Check className="w-3 h-3 text-white/50" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 glass dark:border-gray-700">
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl border-2 border-indigo-500"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-indigo-600"
                  disabled={isUploading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <EmojiPicker
                  onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)}
                />
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  isUploading ? t('uploading_image_chat') : t('type_message_chat')
                }
                disabled={isUploading}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />

              <Button
                onClick={handleSend}
                disabled={(!message.trim() && !selectedImage) || isUploading}
                variant="gradient"
                className="rounded-2xl px-6 h-12 flex items-center justify-center shadow-lg shadow-indigo-500/20"
              >
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="items-center justify-center flex-1 hidden md:flex bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
              <MessageCircle className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t('your_messages_chat')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
              {t('select_chat_desc')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
