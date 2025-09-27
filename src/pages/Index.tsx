import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, TreePine, Users } from "lucide-react";
import forestHero from "@/assets/forest-hero.jpg";
import { MoodInput } from "@/components/MoodInput";
import { AICompanion } from "@/components/AICompanion";
import { GrowthTree } from "@/components/GrowthTree";
import { AnonymousGarden } from "@/components/AnonymousGarden";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'mood' | 'companion' | 'garden'>('home');
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);

  const handleMoodAnalysisComplete = (analysis: any) => {
    setMoodAnalysis(analysis);
    setCurrentView('companion');
  };

  return (
    <div className="min-h-screen bg-gradient-forest relative overflow-hidden">
      {/* Floating particles background */}
      <div className="floating-particles absolute inset-0 pointer-events-none" />
      
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{ backgroundImage: `url(${forestHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background/80" />
          
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-mystical/20 text-mystical border-mystical/30 animate-glow">
              AI-Powered Emotional Support
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-aurora bg-clip-text text-transparent animate-sparkle">
              Mystical Healing
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 mb-8 leading-relaxed">
              Journey through an enchanted forest where AI companions offer personalized emotional support, 
              helping you grow stronger with every step.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card 
                className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 magical-hover cursor-pointer"
                onClick={() => setCurrentView('mood')}
              >
                <Heart className="w-8 h-8 text-healing mx-auto mb-2" />
                <p className="text-sm font-medium">Mood Detection</p>
              </Card>
              
              <Card 
                className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 magical-hover cursor-pointer"
                onClick={() => setCurrentView('companion')}
              >
                <Sparkles className="w-8 h-8 text-mystical mx-auto mb-2" />
                <p className="text-sm font-medium">AI Companion</p>
              </Card>
              
              <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 magical-hover">
                <TreePine className="w-8 h-8 text-nature mx-auto mb-2" />
                <p className="text-sm font-medium">Growth Tree</p>
              </Card>
              
              <Card 
                className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 magical-hover cursor-pointer"
                onClick={() => setCurrentView('garden')}
              >
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-medium">Anonymous Garden</p>
              </Card>
            </div>
            
            <Button 
              size="lg"
              className="bg-gradient-mystical hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              onClick={() => setCurrentView('mood')}
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Content Views */}
      {currentView === 'mood' && (
        <div className="relative z-10 bg-background/95 backdrop-blur-sm">
          <MoodInput 
            onBack={() => setCurrentView('home')} 
            onAnalysisComplete={handleMoodAnalysisComplete}
          />
        </div>
      )}
      
      {currentView === 'companion' && (
        <div className="relative z-10 bg-background/95 backdrop-blur-sm">
          <AICompanion 
            onBack={() => setCurrentView('home')} 
            initialMood={moodAnalysis?.emotion}
          />
        </div>
      )}
      
      {currentView === 'garden' && (
        <div className="relative z-10 bg-background/95 backdrop-blur-sm">
          <AnonymousGarden onBack={() => setCurrentView('home')} />
        </div>
      )}

      {/* Growth Tree - Always visible in corner when on home */}
      {currentView === 'home' && (
        <div className="fixed bottom-6 right-6 z-20">
          <GrowthTree />
        </div>
      )}
    </div>
  );
};

export default Index;