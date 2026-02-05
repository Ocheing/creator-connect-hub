import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-coral shadow-coral flex items-center justify-center hover:bg-coral-dark transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-card-hover overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold">Chat with us</h4>
                  <p className="text-sm text-primary-foreground/70">
                    We usually reply within minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-64 p-4 overflow-y-auto bg-muted/30">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary-foreground">M</span>
                </div>
                <div className="bg-card rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[80%]">
                  <p className="text-sm">
                    Hi there! 👋 Welcome to MicroMatch. How can we help you today?
                  </p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage("");
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" variant="coral">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Powered by MicroMatch Support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
