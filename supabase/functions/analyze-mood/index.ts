import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, quickMood, userId } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const analysisPrompt = `Analyze this emotional input and provide:
    1. Primary emotion detected (happy, sad, anxious, angry, peaceful, excited, etc.)
    2. Emotional intensity (1-10)
    3. A supportive response that acknowledges their feelings
    4. Experience points to award (1-5 based on emotional depth shared)
    
    User input: "${text}"
    ${quickMood ? `Quick mood selected: ${quickMood}` : ''}
    
    Respond in JSON format:
    {
      "emotion": "primary emotion",
      "intensity": number,
      "supportiveMessage": "empathetic response",
      "experiencePoints": number,
      "moodInsights": "brief insight about their emotional state"
    }`;

    // Call Gemini API for mood analysis
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error('Failed to analyze mood');
    }

    const data = await response.json();
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found');
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback analysis');
      // Fallback analysis
      analysis = {
        emotion: quickMood || 'mixed',
        intensity: 5,
        supportiveMessage: "Thank you for sharing your feelings with me. Your emotional awareness is a sign of strength. 🌟",
        experiencePoints: 2,
        moodInsights: "Every emotion you feel is valid and part of your healing journey."
      };
    }

    // Store mood session in database if userId is provided
    if (userId) {
      const { error: sessionError } = await supabase.from('mood_sessions').insert({
        user_id: userId,
        session_type: 'mood_analysis',
        mood_detected: analysis.emotion,
        ai_response: analysis.supportiveMessage,
        experience_gained: analysis.experiencePoints,
        choices: { quickMood, intensity: analysis.intensity }
      });

      if (sessionError) {
        console.error('Error storing mood session:', sessionError);
      }

      // Update user profile with experience points
      const { data: currentProfile } = await supabase.from('profiles')
        .select('total_experience, current_level')
        .eq('user_id', userId)
        .single();

      const newExperience = (currentProfile?.total_experience || 0) + analysis.experiencePoints;
      const newLevel = newExperience >= (currentProfile?.current_level || 1) * 100 
        ? (currentProfile?.current_level || 1) + 1 
        : (currentProfile?.current_level || 1);

      const { error: profileError } = await supabase.from('profiles')
        .update({ 
          total_experience: newExperience,
          current_level: newLevel
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    console.log('Mood analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-mood function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis: {
          emotion: 'uncertain',
          intensity: 5,
          supportiveMessage: "I appreciate you sharing with me. Sometimes it takes time to understand our feelings, and that's perfectly okay. 💚",
          experiencePoints: 1,
          moodInsights: "Your willingness to explore your emotions shows courage."
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});