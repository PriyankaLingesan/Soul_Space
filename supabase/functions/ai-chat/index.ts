// supabase/functions/ai-chat/index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mood, conversationHistory, userId } = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!geminiApiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const systemPrompt = `You are a wise, empathetic AI companion in a mystical healing forest.
Traits:
- Warm, supportive, mystical tone
- Use nature metaphors
- Keep responses short (2–3 sentences)
- Sprinkle forest/nature emojis

Current mood: ${mood || "neutral"}`;

    const messages = [
      { role: "system", parts: [{ text: systemPrompt }] },
      ...(conversationHistory || []),
      { role: "user", parts: [{ text: message }] },
    ];

    let aiResponse = "";
    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages,
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
          }),
        }
      );

      const data = await geminiResponse.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                   "I'm here with you, but something went quiet in the forest 🌲";
    } catch (err) {
      console.error("Gemini fetch error:", err);
      aiResponse = "I'm having trouble connecting right now, but I'm still here with you 🌲";
    }

    // Log interaction
    if (userId) {
      await supabase.from("ai_interactions").insert({
        user_id: userId,
        user_input: message,
        ai_response: aiResponse,
        interaction_type: "companion_chat",
        mood_context: mood,
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        response: "I'm having trouble connecting right now, but I'm still here with you 🌲",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
