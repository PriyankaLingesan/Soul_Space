import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const dailyQuestionSets = {
  gratitude: [
    "What are 3 things you're grateful for today?",
    "Who is someone you appreciate and why?", 
    "What small moment brought you joy recently?",
    "What's something about your body you're thankful for?",
    "What opportunity are you grateful to have?"
  ],
  reflection: [
    "What did you learn about yourself today?",
    "How did you show kindness to someone?",
    "What challenge helped you grow?",
    "What would you tell your past self?",
    "How did you practice self-care today?"
  ],
  growth: [
    "What's one thing you want to improve about yourself?",
    "How did you step out of your comfort zone?", 
    "What fear did you face today?",
    "What new skill do you want to learn?",
    "How can you be more present tomorrow?"
  ],
  connection: [
    "Who made you feel understood today?",
    "How did you connect with nature?",
    "What act of kindness did you witness?",
    "How did you support someone else?",
    "What made you feel part of something bigger?"
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, response, questionId } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'get_daily_question') {
      // Check if user has already answered today's question
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingQuestion } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .single();

      if (existingQuestion) {
        return new Response(
          JSON.stringify({ 
            question: existingQuestion,
            hasAnswered: !!existingQuestion.answered_at,
            success: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate new daily question
      const questionTypes = Object.keys(dailyQuestionSets);
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const questions = dailyQuestionSets[randomType as keyof typeof dailyQuestionSets];
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      // Create new daily question
      const { data: newQuestion, error } = await supabase
        .from('daily_questions')
        .insert({
          user_id: userId,
          question_type: randomType,
          question_text: randomQuestion
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          question: newQuestion,
          hasAnswered: false,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'submit_answer') {
      // Submit answer and award points
      const pointsEarned = Math.floor(response.length / 10) + 3; // Base 3 points + length bonus

      const { error: updateError } = await supabase
        .from('daily_questions')
        .update({
          user_response: response,
          points_earned: pointsEarned,
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update user profile with points and streak
      const today = new Date().toISOString().split('T')[0];
      
      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, last_activity_date, total_experience')
        .eq('user_id', userId)
        .single();

      let newStreak = 1;
      if (profile?.last_activity_date) {
        const lastDate = new Date(profile.last_activity_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          newStreak = (profile.current_streak || 0) + 1;
        } else if (daysDiff === 0) {
          newStreak = profile.current_streak || 1;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_experience: (profile?.total_experience || 0) + pointsEarned,
          current_streak: newStreak,
          last_activity_date: today
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      return new Response(
        JSON.stringify({ 
          pointsEarned,
          newStreak,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-questions function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});