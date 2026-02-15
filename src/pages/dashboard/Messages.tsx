import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { MessageSquare, Search, Send, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Organic Skincare Co.",
    avatar: "OS",
    lastMessage: "Great! Looking forward to seeing the content.",
    time: "2 min ago",
    unread: 2,
    campaign: "Summer Glow Collection",
  },
  {
    id: "2",
    name: "FitLife Supplements",
    avatar: "FL",
    lastMessage: "Can you send the draft by Friday?",
    time: "1 hour ago",
    unread: 0,
    campaign: "Fitness Challenge",
  },
  {
    id: "3",
    name: "MicroMatch Support",
    avatar: "MM",
    lastMessage: "Your payout of KSh 78,000 has been processed.",
    time: "3 hours ago",
    unread: 1,
    campaign: null,
  },
  {
    id: "4",
    name: "GreenHome Kenya",
    avatar: "GH",
    lastMessage: "Welcome aboard! Let's discuss the campaign details.",
    time: "1 day ago",
    unread: 0,
    campaign: "Eco-Friendly Living",
  },
];

const messages = [
  { id: "1", sender: "them", text: "Hi! We loved your content style and would like to discuss the campaign details.", time: "10:00 AM" },
  { id: "2", sender: "me", text: "Thank you! I'm excited about the Summer Glow Collection. What are the key deliverables?", time: "10:15 AM" },
  { id: "3", sender: "them", text: "We need 3 Instagram posts featuring our new sunscreen line, plus 5 Stories showing your daily routine.", time: "10:20 AM" },
  { id: "4", sender: "me", text: "That sounds great! I can start creating content this week. Any specific brand guidelines?", time: "10:30 AM" },
  { id: "5", sender: "them", text: "Great! Looking forward to seeing the content.", time: "10:35 AM" },
];

interface MessagesProps {
  userType?: "influencer" | "brand";
}

const Messages = ({ userType = "influencer" }: MessagesProps) => {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-4">
        <h1 className="text-3xl font-heading font-bold">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={`w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/50 ${
                    selectedConvo.id === convo.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-coral text-sm">{convo.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm truncate">{convo.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{convo.time}</span>
                    </div>
                    {convo.campaign && (
                      <p className="text-xs text-coral truncate">{convo.campaign}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <Badge className="bg-coral text-white border-0 shrink-0">{convo.unread}</Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <span className="font-semibold text-coral text-sm">{selectedConvo.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold">{selectedConvo.name}</p>
                  {selectedConvo.campaign && (
                    <p className="text-xs text-muted-foreground">Re: {selectedConvo.campaign}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.sender === "me"
                        ? "bg-coral text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button variant="coral" size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
