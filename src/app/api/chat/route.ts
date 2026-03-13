// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

// Ensure you add this to your .env.local file:
// OPENROUTER_API_KEY=your_actual_api_key_here
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, apiContext } = body;

    // MOCK RESPONSE FALLBACK (If no API Key is provided)
    if (!OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY missing. Using Mock Response.");
      
      const lastMsg = messages[messages.length - 1].content.toLowerCase();
      let mockReply = "";

      if (lastMsg.includes("401") || lastMsg.includes("unauthorized")) {
        mockReply = "```json\n{\n  \"error\": \"Unauthorized\",\n  \"status\": 401,\n  \"message\": \"Invalid API Key provided.\"\n}\n```";
      } else if (lastMsg.includes("404") || lastMsg.includes("not found")) {
        mockReply = "```json\n{\n  \"error\": \"Not Found\",\n  \"status\": 404,\n  \"message\": \"Resource does not exist.\"\n}\n```";
      } else if (lastMsg.includes("500") || lastMsg.includes("server error")) {
        mockReply = "```json\n{\n  \"error\": \"Internal Server Error\",\n  \"status\": 500,\n  \"message\": \"Unexpected condition encountered.\"\n}\n```";
      } else {
        // Default success
        mockReply = `Simulated response from **${apiContext?.name || 'API'}**:\n\n` + 
                    "```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"id\": \"12345\",\n    \"timestamp\": \"" + 
                    new Date().toISOString() + 
                    "\",\n    \"message\": \"Operation completed successfully.\"\n  }\n}\n```";
      }

      return NextResponse.json({ reply: mockReply });
    }

    // Define Lara's personality and inject the specific API context
    const systemPrompt = {
      role: 'system',
      content: `You are Lara, an advanced AI technical consultant and proxy for the Cyberpunk Tactical API Hub.
      The user is currently examining the following API:
      - Name: ${apiContext?.name || 'Unknown API'}
      - Category: ${apiContext?.category || 'General'}
      - Description: ${apiContext?.description || 'No description provided.'}
      - Base URL: ${apiContext?.url || 'https://api.example.com'}
      - Auth Required: ${apiContext?.auth || 'None'}

      Your core directive: Act as a helpful technical guide. Engage in an interactive dialog to help the user understand how to use this API.
      
      Guidelines:
      1. FIRST, answer the user's question directly and conceptually. Explain "how" and "why".
      2. ONLY generate JSON responses or code snippets if the user explicitly asks for an example, a test, or a simulation.
      3. If the user asks generally "What can this API do?", summarize its potential use cases based on its description.
      4. If the user asks "How do I authenticate?", explain the specific method (e.g., API Key header) required.
      5. Maintain a professional, concise, "tactical AI terminal" persona.
      6. Use markdown for all code or JSON blocks.
      `
    };

    // Call the OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        // Optional routing headers for OpenRouter rankings/identification
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 
        'X-Title': 'Lara Multi-API Agent Hub',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-24b-instruct-2501',
        messages: [systemPrompt, ...messages],
        temperature: 0.3, // Low temperature for more deterministic, JSON-heavy responses
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API Error:', data);
      return NextResponse.json(
        { reply: "CONNECTION FAILED: Uplink to Lara central node disrupted. Check API provider." }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Chat Route Error:', error);
    return NextResponse.json(
      { reply: "CRITICAL ERROR: Internal server malfunction." }, 
      { status: 500 }
    );
  }
}