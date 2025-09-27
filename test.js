// test.js
const geminiApiKey = "AIzaSyARoNBMghOl7X3jGHYRG76cG6xmTKC9eT8";

async function testGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello Gemini, are you working?" }] }],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API error:", text);
      return;
    }

    const data = await response.json();
    console.log("AI response:", data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error("Error calling Gemini API:", err);
  }
}

testGemini();
