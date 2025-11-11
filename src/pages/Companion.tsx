import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const Companion = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        loadMessages(user.id);
      }
    };
    checkAuth();
  }, [navigate]);

  const loadMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data && data.length > 0) {
      const loadedMessages = data.map((msg, index) => ({
        id: index + 1,
        text: msg.message,
        sender: msg.sender as "user" | "ai",
        timestamp: new Date(msg.created_at),
      }));
      setMessages(loadedMessages);
      setConversationStarted(true);
    }
  };

  const saveMessage = async (text: string, sender: "user" | "ai") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: text,
        sender: sender,
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = async () => {
    setConversationStarted(true);
    const welcomeMessage: Message = {
      id: 1,
      text: "Great job staying on track! You're building amazing habits. Remember, every small step counts toward your wellness journey. Ready to tackle your next challenge?",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    await saveMessage(welcomeMessage.text, "ai");
  };

  const sendMessageToAI = async (userMessage: Message) => {
    setIsLoading(true);
    
    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke("wellness-coach", {
        body: { messages: conversationHistory },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const aiResponse = data.choices[0].message.content;
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage(aiResponse, "ai");
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "Connection Error",
        description: "I'm having trouble responding right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    await saveMessage(inputValue, "user");
    sendMessageToAI(userMessage);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your AI Companion
          </h1>
          <p className="text-muted-foreground">
            Your supportive wellness coach is here to help
          </p>
        </div>

        {/* Daily Check-in Card */}
        {!conversationStarted && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-primary/20 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Your Daily Check-in
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Great job staying on track! You're building amazing habits.
                  Remember, every small step counts toward your wellness journey.
                  Ready to tackle your next challenge?
                </p>
                <Button 
                  onClick={startConversation}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  Start Conversation
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Chat Messages */}
        {conversationStarted && (
          <Card className="flex-1 p-6 mb-4 overflow-y-auto shadow-sm">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4 text-primary" />
                  <p>Your wellness coach is ready to chat!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "ai" && (
                        <Avatar className="h-10 w-10 bg-primary flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-10 w-10 bg-primary flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </Card>
        )}

        {/* Input Area */}
        {conversationStarted && (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Companion;
