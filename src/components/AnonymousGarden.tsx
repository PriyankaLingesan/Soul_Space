import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TreePine, Heart, Sparkles, Users, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DailyQuestion } from "./DailyQuestion";

interface AnonymousGardenProps {
  onBack: () => void;
}

interface TreeWhisper {
  id: string;
  text: string;
  mood: 'peaceful' | 'encouraging' | 'wise' | 'hopeful';
  timestamp: Date;
  treeType: string;
  anonymous?: boolean;
}

const sampleWhispers: TreeWhisper[] = [
  {
    id: '1',
    text: "Even the mightiest oak was once a small acorn. Keep growing. 🌰",
    mood: 'encouraging',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    treeType: 'Oak of Strength'
  },
  {
    id: '2', 
    text: "The forest reminds you: storms always pass, but roots grow stronger. ⛈️",
    mood: 'wise',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    treeType: 'Wisdom Willow'
  },
  {
    id: '3',
    text: "A fellow traveler shares: today I found peace in simply breathing. 🍃",
    mood: 'peaceful',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    treeType: 'Serenity Birch'
  },
  {
    id: '4',
    text: "Light always finds a way through the darkest canopy. You will too. ✨",
    mood: 'hopeful',
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
    treeType: 'Hope Pine'
  }
];

const treeTypes = [
  { name: 'Comfort Cedar', color: 'bg-healing', icon: '🌲' },
  { name: 'Courage Oak', color: 'bg-nature', icon: '🌳' },
  { name: 'Peace Palm', color: 'bg-secondary', icon: '🌴' },
  { name: 'Joy Juniper', color: 'bg-accent', icon: '🎋' },
  { name: 'Wisdom Willow', color: 'bg-mystical', icon: '🌿' },
  { name: 'Hope Pine', color: 'bg-primary', icon: '🌲' },
];

export const AnonymousGarden = ({ onBack }: AnonymousGardenProps) => {
  const [whispers, setWhispers] = useState<TreeWhisper[]>([]);
  const [selectedTreeType, setSelectedTreeType] = useState<string>('');
  const [isPlantingTree, setIsPlantingTree] = useState(false);
  const [whisperText, setWhisperText] = useState('');
  const [gardenStats, setGardenStats] = useState({ totalTrees: 0, totalWhispers: 0, activeUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGardenData();
  }, []);

  const fetchGardenData = async () => {
    try {
      // Get community trees and whispers
      const { data: trees, error } = await supabase
        .from('community_trees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Convert to whispers format and use sample data as fallback
      let treeWhispers: TreeWhisper[] = [];
      
      if (trees && trees.length > 0) {
        treeWhispers = trees.map(tree => ({
          id: tree.id,
          text: tree.positive_whisper || "A beautiful tree grows here in silence 🌳",
          mood: 'peaceful' as const,
          timestamp: new Date(tree.created_at),
          treeType: tree.tree_type || 'oak',
          anonymous: true
        }));
      } else {
        // Use sample data if no real data
        treeWhispers = sampleWhispers;
      }

      setWhispers(treeWhispers);

      // Get stats
      const { count: totalTrees } = await supabase
        .from('community_trees')
        .select('*', { count: 'exact' });

      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      setGardenStats({
        totalTrees: totalTrees || 12,
        totalWhispers: totalTrees || 28,
        activeUsers: totalProfiles || 8
      });

    } catch (error) {
      console.error('Error fetching garden data:', error);
      // Use sample data as fallback
      setWhispers(sampleWhispers);
      setGardenStats({ totalTrees: 12, totalWhispers: 28, activeUsers: 8 });
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'peaceful': return '🕊️';
      case 'encouraging': return '💪';
      case 'wise': return '🦉';
      case 'hopeful': return '🌅';
      default: return '✨';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'peaceful': return 'bg-secondary/20 text-secondary';
      case 'encouraging': return 'bg-nature/20 text-nature';
      case 'wise': return 'bg-mystical/20 text-mystical';
      case 'hopeful': return 'bg-accent/20 text-accent';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const handlePlantTree = async () => {
    if (!selectedTreeType || !whisperText.trim()) {
      toast({
        title: "Incomplete Tree",
        description: "Please select a tree type and write your whisper of hope.",
        variant: "destructive"
      });
      return;
    }
    
    setIsPlantingTree(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Allow anonymous planting, but encourage sign up for tracking
      const userId = user?.id || crypto.randomUUID();

      // Plant tree in database
      const { error } = await supabase
        .from('community_trees')
        .insert({
          user_id: userId,
          tree_type: selectedTreeType.toLowerCase().replace(' ', '_'),
          positive_whisper: whisperText.trim(),
          growth_level: 1
        });

      if (error) throw error;

      // Add to local state
      const newWhisper: TreeWhisper = {
        id: Date.now().toString(),
        text: whisperText,
        mood: 'hopeful',
        timestamp: new Date(),
        treeType: selectedTreeType,
        anonymous: true
      };

      setWhispers(prev => [newWhisper, ...prev]);
      setSelectedTreeType('');
      setWhisperText('');

      toast({
        title: "🌳 Tree Planted!",
        description: "Your tree of hope has been planted in the community garden.",
      });

      // Refresh stats
      fetchGardenData();

    } catch (error) {
      console.error('Error planting tree:', error);
      toast({
        title: "Planting Error",
        description: "Unable to plant your tree right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlantingTree(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-aurora bg-clip-text text-transparent mb-4">
            Anonymous Garden of Hope
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A sacred space where anonymous travelers plant trees and share whispers of encouragement. 
            Each tree represents someone's journey of growth and healing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Daily Question */}
          <div className="lg:col-span-1">
            <DailyQuestion />
          </div>

          {/* Tree Whispers */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-mystical animate-sparkle" />
                  Forest Whispers
                  <Badge className="bg-nature/20 text-nature">
                    {isLoading ? '...' : whispers.length} messages
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <TreePine className="w-8 h-8 mx-auto mb-2 animate-pulse text-nature" />
                    <p className="text-muted-foreground">Growing whispers...</p>
                  </div>
                ) : (
                  whispers.map((whisper) => (
                    <Card 
                      key={whisper.id}
                      className="bg-background/50 border-l-4 border-l-primary/50 hover:shadow-glow transition-all duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getMoodColor(whisper.mood)}>
                            {getMoodIcon(whisper.mood)} {whisper.mood}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {whisper.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <p className="text-foreground mb-2">{whisper.text}</p>
                        
                        <div className="flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-nature" />
                          <span className="text-sm text-muted-foreground italic">
                            — from {whisper.treeType}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plant Your Tree */}
          <div className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-healing" />
                  Plant Your Tree
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose a tree and share a whisper of hope for other travelers.
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {treeTypes.map((tree) => (
                    <Button
                      key={tree.name}
                      variant="outline"
                      className={`justify-start h-auto p-3 hover:shadow-glow transition-all duration-300 ${
                        selectedTreeType === tree.name ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTreeType(tree.name)}
                      disabled={isPlantingTree}
                    >
                      <span className="text-lg mr-3">{tree.icon}</span>
                      <div className="text-left">
                        <p className="font-medium">{tree.name}</p>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedTreeType && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share a whisper of hope, encouragement, or wisdom for other travelers..."
                      value={whisperText}
                      onChange={(e) => setWhisperText(e.target.value)}
                      className="min-h-[100px] bg-background/50 border-primary/20 focus:border-primary resize-none"
                      disabled={isPlantingTree}
                    />
                    
                    <Button
                      onClick={handlePlantTree}
                      disabled={!whisperText.trim() || isPlantingTree}
                      className="w-full bg-gradient-healing hover:shadow-healing"
                    >
                      {isPlantingTree ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Planting {selectedTreeType}...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Plant Tree of Hope
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-mystical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-healing animate-glow" />
                  Garden Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trees Planted</span>
                  <Badge className="bg-nature/20 text-nature">
                    {isLoading ? '...' : gardenStats.totalTrees}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Whispers Shared</span>
                  <Badge className="bg-mystical/20 text-mystical">
                    {isLoading ? '...' : gardenStats.totalWhispers}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Gardeners</span>
                  <Badge className="bg-accent/20 text-accent">
                    {isLoading ? '...' : gardenStats.activeUsers}
                  </Badge>
                </div>
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground italic">
                    🌱 Growing together in healing
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};