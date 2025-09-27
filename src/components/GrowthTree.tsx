import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreePine, Star, Heart, Sparkles } from "lucide-react";
import treeOfGrowthImg from "@/assets/tree-of-growth.jpg";
import { supabase } from "@/integrations/supabase/client";

interface GrowthData {
  level: number;
  experiences: number;
  mood_improvements: number;
  days_active: number;
  affirmations_collected: number;
}

export const GrowthTree = () => {
  const [growthData, setGrowthData] = useState<GrowthData>({
    level: 1,
    experiences: 0,
    mood_improvements: 0,
    days_active: 0,
    affirmations_collected: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_experience, current_level, current_streak')
        .eq('user_id', user.id)
        .single();

      // Get mood sessions count
      const { count: sessionsCount } = await supabase
        .from('mood_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Get AI interactions count  
      const { count: interactionsCount } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Calculate days active (simplified)
      const { count: daysActive } = await supabase
        .from('daily_questions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .not('answered_at', 'is', null);

      setGrowthData({
        level: profile?.current_level || 1,
        experiences: sessionsCount || 0,
        mood_improvements: interactionsCount || 0,
        days_active: daysActive || 0,
        affirmations_collected: Math.floor((profile?.total_experience || 0) / 5),
      });

    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate tree growth percentage
  const getGrowthPercentage = () => {
    const totalProgress = growthData.experiences + growthData.mood_improvements;
    return Math.min((totalProgress / 10) * 100, 100);
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const percentage = getGrowthPercentage();
    if (percentage >= 80) return "Your inner light shines brilliantly! 🌟";
    if (percentage >= 60) return "Beautiful growth is happening! 🌱";
    if (percentage >= 40) return "Your journey is taking root! 🌿";
    if (percentage >= 20) return "Small steps, big possibilities! ✨";
    return "Welcome to your healing journey! 🌱";
  };

  return (
    <Card 
      className={`bg-card/95 backdrop-blur-sm border-nature/30 shadow-mystical cursor-pointer transition-all duration-500 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Tree Icon/Avatar */}
          <div className="relative flex-shrink-0">
            <img 
              src={treeOfGrowthImg}
              alt="Growth Tree"
              className={`w-10 h-10 rounded-full object-cover border-2 border-nature/50 ${
                isLoading ? 'animate-pulse' : 'animate-glow'
              }`}
            />
            <Badge className="absolute -top-1 -right-1 bg-nature text-xs px-1 animate-pulse">
              {isLoading ? '...' : growthData.level}
            </Badge>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="w-4 h-4 text-nature" />
                <span className="font-semibold text-sm">Personal Growth Tree</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-healing h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getGrowthPercentage()}%` }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-accent" />
                  <span>{growthData.experiences} sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-healing" />
                  <span>{growthData.mood_improvements} lifts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-mystical" />
                  <span>{growthData.affirmations_collected} gems</span>
                </div>
                <div className="flex items-center gap-1">
                  <TreePine className="w-3 h-3 text-nature" />
                  <span>{growthData.days_active} days</span>
                </div>
              </div>

              {/* Motivational Message */}
              <p className="text-xs text-muted-foreground italic text-center bg-gradient-glow rounded p-2">
                {getMotivationalMessage()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};