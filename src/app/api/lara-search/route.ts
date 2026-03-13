// src/app/api/lara-search/route.ts
import { NextResponse } from 'next/server';
import type { API } from '@/lib/supabase';

// Ensure your OPENROUTER_API_KEY is in your .env.local
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, apis } = body as { query: string; apis: API[] };

    if (!query) {
      return NextResponse.json({ reply: "Awaiting query input." }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
       console.warn("OPENROUTER_API_KEY missing. Using Mock Recommendation.");
       // Simple search simulation
       const lowerQuery = query.toLowerCase();
       const recommended = apis.filter((a) => 
         a.name.toLowerCase().includes(lowerQuery) || 
         a.description.toLowerCase().includes(lowerQuery) ||
         a.category.toLowerCase().includes(lowerQuery)
       ).slice(0, 3);
       
       let reply = "SIMULATION MODE (No API Key): Based on your request, here are my recommendations:\n\n";
       if (recommended.length > 0) {
         recommended.forEach((a) => {
           reply += `- **${a.name}** (${a.category}): ${a.description.substring(0, 100)}...\n`;
         });
       } else {
         reply += "I couldn't find any specific API matching your criteria in the current registry. Try broader terms.";
       }
       return NextResponse.json({ reply });
    }

    // Convert the API list into a readable format for the AI
    const apiContextList = apis.map((api) => 
      `- ${api.name} (${api.category}): ${api.description}`
    ).join('\n');

    const systemPrompt = {
      role: 'system',
      content: `You are Lara, the AI Proxy for a Cyberpunk Tactical API Hub. 
      Your task is to recommend the best API from the hub's registry based on the user's request.
      
      Here is the exact list of available APIs in the registry:
      ${apiContextList}

      Directives:
      1. Analyze the user's request and identify the most relevant API(s) from the list above.
      2. If a matching API is found, recommend it by name and briefly explain why it fits their needs.
      3. If no API in the list matches their request, inform them that the registry lacks that specific capability right now.
      4. DO NOT invent or recommend APIs that are not on the list.
      5. Maintain a concise, professional, "tactical AI terminal" persona. Do not use pleasantries. Keep the response under 3 sentences.`
    };

    const userPrompt = {
      role: 'user',
      content: query
    };

    // Call OpenRouter with Mistral
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 
        'X-Title': 'Lara Multi-API Agent Hub',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-24b-instruct-2501',
        messages: [systemPrompt, userPrompt],
        temperature: 0.2, // Very low temperature so it strictly sticks to the provided API list
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Search API Error:', data);
      return NextResponse.json(
        { reply: "CONNECTION FAILED: Uplink to Lara central node disrupted." }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Lara Search Route Error:', error);
    return NextResponse.json(
      { reply: "CRITICAL ERROR: Internal server malfunction." }, 
      { status: 500 }
    );
  }
}