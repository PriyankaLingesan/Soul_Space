import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Heart, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MoodInputProps {
  onBack: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

const moodPrompts = [
  "How are you feeling right now?",
  "What's been on your mind lately?",
  "Share something that happened today...",
  "What would make today better?",
  "Tell me about your current mood...",
];

const quickMoods = [
  { emoji: "😊", label: "Happy", color: "bg-healing" },
  { emoji: "😔", label: "Sad", color: "bg-secondary" },
  { emoji: "😰", label: "Anxious", color: "bg-accent" },
  { emoji: "😴", label: "Tired", color: "bg-muted" },
  { emoji: "🔥", label: "Energetic", color: "bg-primary" },
  { emoji: "😌", label: "Peaceful", color: "bg-nature" },
];

export const MoodInput = ({ onBack, onAnalysisComplete }: MoodInputProps) => {
  const [moodText, setMoodText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(moodPrompts[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!moodText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: {
          text: moodText,
          quickMood: selectedMood,
          userId: user?.id
        }
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      
      // Show success message and navigate after delay
      toast({
        title: "✨ Mood Analyzed",
        description: data.analysis.supportiveMessage,
      });

      setTimeout(() => {
        onAnalysisComplete(data.analysis);
      }, 2000);

    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast({
        title: "Analysis Error", 
        description: "Unable to analyze mood right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshPrompt = () => {
    const newPrompt = moodPrompts[Math.floor(Math.random() * moodPrompts.length)];
    setCurrentPrompt(newPrompt);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forest
          </Button>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-healing animate-glow" />
              <CardTitle className="text-2xl bg-gradient-healing bg-clip-text text-transparent">
                Share Your Heart
              </CardTitle>
              <Brain className="w-6 h-6 text-mystical animate-sparkle" />
            </div>
            <p className="text-muted-foreground">
              Our AI companion listens with empathy and understanding
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Dynamic Prompt */}
            <div className="text-center p-4 bg-gradient-glow rounded-lg">
              <p className="text-lg font-medium text-foreground mb-2">{currentPrompt}</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={refreshPrompt}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                New prompt
              </Button>
            </div>

            {/* Quick Mood Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Quick mood check:</p>
              <div className="flex flex-wrap gap-2">
                {quickMoods.map((mood) => (
                  <Badge
                    key={mood.label}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedMood === mood.label 
                        ? `${mood.color} text-white shadow-glow` 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setSelectedMood(
                      selectedMood === mood.label ? null : mood.label
                    )}
                  >
                    <span className="mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Express yourself here... The forest is listening 🌲"
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary resize-none"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                Your words are safe and private. AI analysis helps create personalized support.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!moodText.trim() || isAnalyzing}
              className="w-full bg-gradient-healing hover:shadow-healing transition-all duration-300"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  AI is understanding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Share with AI Companion
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="text-center p-4 bg-gradient-glow rounded-lg animate-pulse">
                <p className="text-sm text-muted-foreground">
                  ✨ Analyzing emotional patterns and crafting personalized support...
                </p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="text-center p-4 bg-gradient-healing rounded-lg">
                <p className="text-sm font-medium mb-2">🌟 Analysis Complete</p>
                <p className="text-sm text-muted-foreground">
                  Emotion: <strong>{analysisResult.emotion}</strong> | 
                  Experience gained: <strong>{analysisResult.experiencePoints} XP</strong>
                </p>
                <p className="text-xs mt-2 italic">{analysisResult.moodInsights}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};