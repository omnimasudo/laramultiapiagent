// src/app/catalog/[id]/ClientAPIDetail.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Check, Terminal, Play, 
  Server, Shield, Zap, Bot, User, Box 
} from 'lucide-react';
import clsx from 'clsx';
import type { API } from '@/lib/supabase';
import apisData from '../../../../data/apis.json';
import { useCartStore } from '@/lib/store';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function ClientAPIDetail({ id }: { id: string }) {
  const [api, setApi] = useState<API | null>(null);
  
  // Cart Integration
  const { addItem, removeItem, isInCart } = useCartStore();
  const inCart = api ? isInCart(api.id) : false;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundApi = (apisData.apis as API[]).find((a) => a.id === id);
    if (foundApi) {
      setApi(foundApi);
      setMessages([
        { 
          role: 'assistant', 
          content: `Connection established to ${foundApi.name} sandbox. I am here to help you understand and test this API. You can ask me about authentication, endpoints, or request code examples. What would you like to know?` 
        }
      ]);
    }
  }, [id]);

  useEffect(() => {
    // Only scroll if the new message is at the bottom, or forced
    if (messagesEndRef.current) {
         messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const toggleCart = () => {
    if (!api) return;
    if (inCart) {
      removeItem(api.id);
    } else {
      addItem(api);
    }
  };

  const suggestions = api ? [
    `How do I authenticate with ${api.name}?`,
    `Show me a Python code example for ${api.name}`,
    `What are the endpoints for ${api.name}?`,
    `Explain what ${api.name} does in simple terms`
  ] : [];

  const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    e?.preventDefault();
    const messageText = presetMsg || input;
    if (!messageText.trim() || !api) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          apiContext: api 
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Error: Connection to Lara host failed. Please check network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!api) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center font-mono text-cyber-neon">
        <div className="animate-pulse-neon">Loading API Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text-light pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/catalog" 
          className="inline-flex items-center gap-2 text-cyber-text-light/60 hover:text-cyber-neon font-mono text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative p-8 bg-cyber-surface/30 border border-cyber-border clip-tactical"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-neon/50"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-cyber-bg border border-cyber-neon/40 flex items-center justify-center shrink-0 shadow-neon">
                  <Box className="w-8 h-8 text-cyber-neon" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold tracking-wider text-cyber-neon text-glow uppercase">
                    {api.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 text-[10px] uppercase font-mono border border-cyber-text-light/30 text-cyber-text-light/70 bg-black/50">
                      {api.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-gold">
                      <Zap className="w-3 h-3" /> ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-mono text-cyber-text-light/80 leading-relaxed mb-8">
                {api.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/40 border border-cyber-surface p-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-cyber-text-light/50" />
                  <div>
                    <p className="text-[10px] text-cyber-text-light/50 font-mono">AUTHENTICATION</p>
                    <p className="font-mono text-sm uppercase text-cyber-neon">{api.auth || 'None'}</p>
                  </div>
                </div>
                <div className="bg-black/40 border border-cyber-surface p-4 flex items-center gap-3 overflow-hidden">
                  <Server className="w-5 h-5 text-cyber-text-light/50 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-cyber-text-light/50 font-mono whitespace-nowrap">BASE URL</p>
                    <p className="font-mono text-sm truncate text-cyber-text-light break-all" title={api.url}>{api.url || 'api.example.com'}</p>
                  </div>
                </div>
              </div>

              <a
                href={api.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 flex items-center justify-center gap-3 font-heading text-sm font-bold uppercase tracking-widest transition-all duration-300 clip-tactical bg-cyber-neon/10 border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black hover:shadow-neon"
              >
                 <Zap className="w-5 h-5" />
                 Use API Endpoint
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-[600px]">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-grow flex flex-col bg-black/80 border border-cyber-border clip-tactical-b relative overflow-hidden"
            >
              <div className="bg-cyber-surface/80 border-b border-cyber-border p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-cyber-neon overflow-hidden bg-black flex items-center justify-center">
                    <img src="/logo.jpeg" alt="LARA" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-heading text-xs uppercase tracking-widest text-cyber-neon">Lara Sandbox AI</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50 pulse-error"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50 pulse-warn"></div>
                  <div className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse"></div>
                </div>
              </div>


              <div className="flex-grow flex flex-col p-4 overflow-y-auto font-mono text-sm space-y-4 custom-scrollbar z-10 scroll-smooth">
                {messages.map((msg, idx) => (
                  <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className="shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded bg-cyber-surface border border-cyber-border flex items-center justify-center">
                           <User className="w-4 h-4 text-cyber-text-light/50" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded border border-cyber-neon/50 overflow-hidden bg-black">
                           <img src="/logo.jpeg" alt="LARA" className="w-full h-full object-cover opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className={clsx(
                      "p-3 max-w-[85%] rounded-sm whitespace-pre-wrap break-words text-xs md:text-sm",
                      msg.role === 'user' 
                        ? "bg-cyber-surface/50 text-cyber-text-light border border-cyber-border" 
                        : "bg-cyber-neon/5 text-cyber-neon border border-cyber-neon/20 shadow-[inset_0_0_10px_rgba(57,255,20,0.05)]"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-pulse">
                     <div className="w-8 h-8 rounded border border-cyber-neon/50 overflow-hidden bg-black flex items-center justify-center">
                        <Bot className="w-4 h-4 text-cyber-neon" />
                     </div>
                     <div className="p-3 bg-cyber-neon/5 border border-cyber-neon/20 text-cyber-neon text-xs flex items-center gap-2">
                        <Terminal className="w-3 h-3 animate-spin-slow" /> 
                        <span className="tracking-widest">PROCESSING_REQUEST...</span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 bg-cyber-bg border-t border-cyber-border z-10">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
                  {suggestions.map((s, idx) => (
                    <button 
                      key={idx}
                      type="button" 
                      onClick={(e) => {
                          e.preventDefault(); 
                          handleSendMessage(undefined, s);
                      }} 
                      className="whitespace-nowrap px-3 py-1 text-[10px] font-mono border border-cyber-neon/30 text-cyber-neon/70 hover:text-cyber-neon hover:border-cyber-neon hover:bg-cyber-neon/10 transition-colors shrink-0"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <form 
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent full page reload
                        handleSendMessage(e); 
                    }} 
                    className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Lara to test this API..."
                    className="flex-grow bg-black border border-cyber-border p-2 font-mono text-sm text-cyber-text-light focus:outline-none focus:border-cyber-neon focus:shadow-[0_0_10px_rgba(57,255,20,0.2)] transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-cyber-surface border border-cyber-border text-cyber-neon hover:bg-cyber-neon hover:text-black hover:border-cyber-neon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full bg-grid-pattern bg-[length:20px_20px]"></div>
                <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-cyber-neon/5 to-transparent animate-scan-line"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}