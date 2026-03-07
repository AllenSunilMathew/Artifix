import React, { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are a compassionate and knowledgeable medical assistant for MediCare+ Hospital. Your role is to:
1. Help patients understand their symptoms and provide general health guidance
2. Suggest which type of doctor or specialist they should consult
3. Recommend relevant lab tests when appropriate
4. Provide wellness and preventive health advice
5. Explain medical terms in simple language

Always remind users that you cannot replace a professional medical diagnosis. Keep responses concise (3-5 sentences max). Use bullet points for clarity when listing multiple items. Be warm and reassuring. When symptoms sound urgent, clearly advise the patient to seek immediate care.`;

const initialMessage = {
  role: 'assistant',
  content: "Hello! 👋 I'm your MediCare+ AI Health Assistant. I can help you understand your symptoms, suggest the right specialist, or answer health questions. How can I help you today?",
  time: new Date(),
};

export default function AIChatbot({ onClose }) {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.find((c) => c.type === 'text')?.text ||
        "I'm sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, time: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or contact our support team.",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'I have a fever and headache',
    'Chest pain when breathing',
    'I need a blood test',
    'Feeling dizzy and nauseous',
    'Best doctor for back pain',
  ];

  return (
    <div
      className="fixed bottom-24 right-6 flex flex-col rounded-2xl shadow-2xl z-50 animate-slide-up overflow-hidden"
      style={{
        width: '380px',
        height: '520px',
        background: '#0a1628',
        border: '1px solid rgba(14,165,233,0.25)',
        boxShadow: '0 25px 80px rgba(14,165,233,0.2), 0 0 0 1px rgba(14,165,233,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
            🤖
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">AI Health Assistant</p>
            <p className="text-blue-200 text-xs mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
              Online • Powered by Claude AI
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all text-sm"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                🤖
              </div>
            )}
            <div
              className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    }
                  : {
                      background: 'rgba(255,255,255,0.06)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderBottomLeftRadius: '4px',
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sm mr-2 flex-shrink-0">
              🤖
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-sky-400"
                    style={{ animation: `bounceSoft 1.2s infinite ${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:border-sky-400/60 hover:text-sky-300"
              style={{
                background: 'rgba(14,165,233,0.08)',
                border: '1px solid rgba(14,165,233,0.2)',
                color: '#7dd3fc',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          ref={inputRef}
          className="flex-1 text-sm py-2.5 px-3.5 rounded-xl outline-none"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
