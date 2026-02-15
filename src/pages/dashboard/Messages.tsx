import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Loader2, Paperclip } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Message, Profile } from "@/types/database.types";
import { format } from "date-fns";
import { messageService } from "@/services/api";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Conversation = {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
};

interface MessagesProps {
  userType?: "influencer" | "brand" | "admin";
}

const Messages = ({ userType = "influencer" }: MessagesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all messages for the current user
  const { data: rawMessages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return messageService.getConversations(user.id);
    },
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds as a fallback
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
    };

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        handleInvalidate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`,
        },
        handleInvalidate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Extract unique partner IDs to fetch their profiles
  const partnerIds = useMemo(() => {
    if (!user) return [];
    const ids = new Set<string>();
    rawMessages.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      ids.add(partnerId);
    });
    return Array.from(ids);
  }, [rawMessages, user]);

  // Fetch profiles for all partners
  const { data: profiles = [] } = useQuery({
    queryKey: ["message-profiles", partnerIds],
    queryFn: async () => {
      if (partnerIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', partnerIds);

      if (error) throw error;
      return data as Partial<Profile>[];
    },
    enabled: partnerIds.length > 0,
  });

  // Group messages into conversations
  const conversations = useMemo(() => {
    if (!user) return [];

    const groups: Record<string, Message[]> = {};

    // Group by partner ID
    rawMessages.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!groups[partnerId]) groups[partnerId] = [];
      groups[partnerId].push(msg);
    });

    // Create conversation objects
    const convos: Conversation[] = Object.keys(groups).map(partnerId => {
      const msgs = groups[partnerId].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMsg = msgs[msgs.length - 1];
      const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
      const profile = profiles.find(p => p.id === partnerId);

      return {
        partnerId,
        partnerName: profile?.full_name || "Unknown User",
        partnerAvatar: profile?.avatar_url || undefined,
        lastMessage: lastMsg.body,
        lastMessageAt: lastMsg.created_at,
        unreadCount: unread,
        messages: msgs,
      };
    });

    // Sort conversations by last message time (desc)
    return convos.sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [rawMessages, profiles, user]);

  // Select first conversation by default if none selected
  useEffect(() => {
    if (!selectedConvoId && conversations.length > 0) {
      setSelectedConvoId(conversations[0].partnerId);
    }
  }, [conversations, selectedConvoId]);

  const selectedConversation = useMemo(() =>
    conversations.find(c => c.partnerId === selectedConvoId),
    [conversations, selectedConvoId]
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (vars: { receiverId: string; body: string }) => {
      if (!user) throw new Error("No user");
      return messageService.sendMessage({
        sender_id: user.id,
        receiver_id: vars.receiverId,
        body: vars.body,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
    },
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConvoId) return;
    sendMessageMutation.mutate({
      receiverId: selectedConvoId,
      body: newMessage,
    });
  };

  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingMessages) {
    return (
      <DashboardLayout userType={userType}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
        <div>
          <h1 className="text-3xl font-heading font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with brands and influencers.</p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 flex-1 overflow-hidden h-full pb-4">
          {/* Conversation List */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden h-full">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {filteredConversations.map((convo) => (
                  <button
                    key={convo.partnerId}
                    onClick={() => setSelectedConvoId(convo.partnerId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${selectedConvoId === convo.partnerId ? "bg-muted" : ""
                      }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={convo.partnerAvatar} />
                      <AvatarFallback>{convo.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold truncate text-sm">{convo.partnerName}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(convo.lastMessageAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {convo.lastMessage}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] shrink-0">
                        {convo.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
                {filteredConversations.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No conversations found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden h-full">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-border/50 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.partnerAvatar} />
                      <AvatarFallback>{selectedConversation.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.partnerName}</h3>
                      {/* Placeholder for status */}
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((msg, index) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2 ${isMe
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                              : "bg-muted rounded-2xl rounded-tl-sm"
                              }`}
                          >
                            <p className="text-sm">{msg.body}</p>
                            <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                              {format(new Date(msg.created_at), 'p')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-card shrink-0">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2"
                  >
                    <Button variant="ghost" size="icon" type="button" className="shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Messages;
