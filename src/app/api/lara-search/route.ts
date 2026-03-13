// src/app/api/lara-search/route.ts
import { NextResponse } from 'next/server';
import type { API } from '@/lib/supabase';

// Ensure your OPENROUTER_API_KEY is in your .env.local
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  let query: string = '';
  let apis: API[] = [];

  try {
    const body = await req.json();
    const parsed = body as { query: string; apis: API[] };
    query = parsed.query;
    apis = parsed.apis;

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

    // Retry logic to handle transient network errors (ECONNRESET)
    // We try up to 3 times with a short delay
    let response;
    let lastError;
    
    for (let i = 0; i < 3; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 
                    'X-Title': 'Lara Multi-API Agent Hub',
                    'Content-Type': 'application/json',
                    'Connection': 'close', // Disable keep-alive to reduce ECONNRESET likelihood
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-small-24b-instruct-2501',
                    messages: [systemPrompt, userPrompt],
                    temperature: 0.2, // Very low temperature
                }),
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) break; // Success, exit loop
            
            // If it's a 5xx error, maybe retry, but for now we just break on non-network errors unless it's a rate limit
            if (response.status !== 429 && response.status < 500) break;

        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;
            console.warn(`Attempt ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            if (i < 2) await new Promise(res => setTimeout(res, 1000)); // Wait 1s before retry
        }
    }

    if (!response) {
        throw lastError || new Error("Failed to connect to AI service after multiple attempts.");
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter Search API Error:', data);
      
      // If it's an auth error, fall back to mock mode
      if (response.status === 401 || response.status === 403) {
        console.warn("OpenRouter API Key invalid. Falling back to mock mode.");
        const lowerQuery = query.toLowerCase();
        const recommended = apis.filter((a) => 
          a.name.toLowerCase().includes(lowerQuery) || 
          a.description.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);
        
        let reply = "AUTHENTICATION ERROR: API key invalid. Using offline mode.\n\nBased on your request, here are my recommendations:\n\n";
        if (recommended.length > 0) {
          recommended.forEach((a) => {
            reply += `- **${a.name}** (${a.category}): ${a.description.substring(0, 100)}...\n`;
          });
        } else {
          reply += "I couldn't find any specific API matching your criteria in the current registry. Try broader terms.";
        }
        return NextResponse.json({ reply });
      }
      
      return NextResponse.json(
        { reply: "CONNECTION FAILED: Uplink to Lara central node disrupted." }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Lara Search Route Error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn("OpenRouter request timed out. Falling back to mock mode.");
        // Fallback to mock response on timeout
        const lowerQuery = query.toLowerCase();
        const recommended = apis.filter((a) => 
          a.name.toLowerCase().includes(lowerQuery) || 
          a.description.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);
        
        let reply = "TIMEOUT ERROR: Connection to AI service timed out. Using offline mode.\n\nBased on your request, here are my recommendations:\n\n";
        if (recommended.length > 0) {
          recommended.forEach((a) => {
            reply += `- **${a.name}** (${a.category}): ${a.description.substring(0, 100)}...\n`;
          });
        } else {
          reply += "I couldn't find any specific API matching your criteria in the current registry. Try broader terms.";
        }
        return NextResponse.json({ reply });
      }
      
      // Handle network errors like ECONNRESET
      if (error.message.includes('ECONNRESET') || error.message.includes('fetch failed')) {
        console.warn("Network error detected. Falling back to mock mode.");
        // Fallback to mock response on network errors
        const lowerQuery = query.toLowerCase();
        const recommended = apis.filter((a) => 
          a.name.toLowerCase().includes(lowerQuery) || 
          a.description.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);
        
        let reply = "NETWORK ERROR: Connection reset. Using offline mode.\n\nBased on your request, here are my recommendations:\n\n";
        if (recommended.length > 0) {
          recommended.forEach((a) => {
            reply += `- **${a.name}** (${a.category}): ${a.description.substring(0, 100)}...\n`;
          });
        } else {
          reply += "I couldn't find any specific API matching your criteria in the current registry. Try broader terms.";
        }
        return NextResponse.json({ reply });
      }
    }
    
    return NextResponse.json(
      { reply: "CRITICAL ERROR: Internal server malfunction." }, 
      { status: 500 }
    );
  }
}