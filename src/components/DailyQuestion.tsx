import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DailyQuestion {
  id: string;
  question_text: string;
  question_type: string;
  user_response?: string;
  points_earned?: number;
  answered_at?: string;
}

interface DailyQuestionProps {
  onComplete?: (points: number, streak: number) => void;
}

export const DailyQuestion = ({ onComplete }: DailyQuestionProps) => {
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const fetchDailyQuestion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('daily-questions', {
        body: {
          action: 'get_daily_question',
          userId: user.id
        }
      });

      if (error) throw error;

      setQuestion(data.question);
      setHasAnswered(data.hasAnswered);
      if (data.hasAnswered) {
        setResponse(data.question.user_response || '');
      }
    } catch (error) {
      console.error('Error fetching daily question:', error);
      toast({
        title: "Error",
        description: "Unable to load daily question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!response.trim() || !question) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('daily-questions', {
        body: {
          action: 'submit_answer',
          userId: user.id,
          questionId: question.id,
          response: response.trim()
        }
      });

      if (error) throw error;

      setHasAnswered(true);
      
      toast({
        title: "🎉 Question Completed!",
        description: `You earned ${data.pointsEarned} points! Streak: ${data.newStreak} days`,
      });

      onComplete?.(data.pointsEarned, data.newStreak);

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Submission Error",
        description: "Unable to submit your answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <Sparkles className="w-8 h-8 mx-auto mb-2 animate-spin text-mystical" />
            <p className="text-muted-foreground">Loading your daily reflection...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No daily question available</p>
        </CardContent>
      </Card>
    );
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'gratitude': return 'bg-healing';
      case 'reflection': return 'bg-mystical';
      case 'growth': return 'bg-nature';
      case 'connection': return 'bg-secondary';
      default: return 'bg-primary';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'gratitude': return '🙏';
      case 'reflection': return '🪞';
      case 'growth': return '🌱';
      case 'connection': return '🤝';
      default: return '✨';
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-accent" />
            Daily Reflection
          </CardTitle>
          <Badge className={`${getQuestionTypeColor(question.question_type)} text-white`}>
            {getQuestionTypeIcon(question.question_type)} {question.question_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-glow rounded-lg">
          <p className="text-base font-medium leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {hasAnswered ? (
          <div className="space-y-3">
            <div className="p-4 bg-background/50 rounded-lg border-2 border-dashed border-primary/20">
              <p className="text-sm font-medium text-muted-foreground mb-2">Your Response:</p>
              <p className="text-sm leading-relaxed">{response}</p>
            </div>
            
            <div className="flex items-center justify-center gap-4 p-3 bg-gradient-healing rounded-lg">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">
                  {question.points_earned || 0} points earned
                </span>
              </div>
              <Badge variant="outline" className="bg-white/10">
                ✅ Completed
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts here... Take your time to reflect deeply."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary resize-none"
              disabled={isSubmitting}
            />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                💡 Thoughtful responses earn more experience points
              </p>
              
              <Button
                onClick={handleSubmit}
                disabled={!response.trim() || isSubmitting}
                className="bg-gradient-healing hover:shadow-healing"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Reflection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground italic bg-gradient-glow/50 rounded p-2">
          🌟 Daily reflections help you grow mindfully and earn experience for your journey
        </div>
      </CardContent>
    </Card>
  );
};