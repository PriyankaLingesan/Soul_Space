import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Sparkles, Heart, Star } from "lucide-react";
import aiCompanionImg from "@/assets/ai-companion.jpg";
import { useToast } from "@/components/ui/use-toast";

interface AICompanionProps {
  onBack: () => void;
  initialMood?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// ⚠️ Hardcode your Gemini key like in testAI.js
const GEMINI_API_KEY = "AIzaSyARoNBMghOl7X3jGHYRG76cG6xmTKC9eT8";

export function AICompanion({ onBack }: AICompanionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [companionMood, setCompanionMood] = useState("peaceful");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "🌿 Welcome, traveler. I sense your energy today. How may I guide you?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // ✅ Exact same request style as testAI.js
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: userMessage.text }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini API response:", data); // 👀 Debug log

      const aiReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🌲 The forest is quiet, but I am here.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Randomize mood
      const moods = ["peaceful", "caring", "encouraging", "wise"];
      setCompanionMood(moods[Math.floor(Math.random() * moods.length)]);
    } catch (err) {
      console.error("Gemini fetch error:", err);
      toast({
        title: "Connection Issue",
        description: "Could not reach Gemini right now 🌲",
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "⚠️ I can’t reach the forest spirits right now, but I’m still here.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Forest
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar */}
          <Card className="lg:col-span-1 bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
            <CardHeader className="text-center">
              <CardTitle>Your AI Companion</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative">
                <img
                  src={aiCompanionImg}
                  alt="AI Companion"
                  className="w-32 h-32 mx-auto rounded-full object-cover shadow-glow animate-float"
                />
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  {companionMood}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                "I’m here to listen, understand, and support you 🌿"
              </p>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2 bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent animate-sparkle" />
                Sacred Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-4 p-4 bg-background/30 rounded-lg">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        m.isUser
                          ? "bg-gradient-mystical text-white"
                          : "bg-gradient-healing text-black"
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {m.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-healing p-3 rounded-lg animate-pulse">
                      <span>...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Share your thoughts..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                  disabled={isTyping}
                />
                <Button onClick={handleSend} disabled={!inputText.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
