import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key points?',
  'Explain the main topic',
];

export default function ChatWindow({ messages, loading, onSend }) {
  const [input, setInput] = useState('');
  const bottomRef         = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            {/* Welcome icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20
            flex items-center justify-center glow-green">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono mb-2">
                &gt; ready_to_assist
              </h2>
              <p className="text-white/30 text-sm max-w-sm font-mono leading-relaxed">
                // upload documents → ask questions<br/>
                // get accurate answers with sources
              </p>
            </div>
            {/* Suggestion buttons */}
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => onSend(s)}
                  className="px-4 py-2 bg-white/5 hover:bg-[#00ff88]/10
                  border border-white/10 hover:border-[#00ff88]/40
                  text-white/40 hover:text-[#00ff88] text-xs font-mono
                  rounded-xl transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#00ff88]/10 border border-[#00ff88]/20
                rounded-lg flex items-center justify-center text-sm">🤖</div>
                <div className="bg-black border border-white/10 rounded-2xl
                rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0,1,2].map((i) => (
                      <div key={i}
                        className="w-2 h-2 bg-[#00ff88] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black">
        <div className="flex gap-3 items-end bg-white/5 border border-white/10
        focus-within:border-[#00ff88]/40 focus-within:bg-[#00ff88]/5
        rounded-2xl px-4 py-3 transition-all">
          <textarea rows={1} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="// ask anything about your documents..."
            className="flex-1 bg-transparent text-white text-sm font-mono
            placeholder-white/20 outline-none resize-none max-h-32 leading-relaxed"
          />
          <button onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-[#00ff88] hover:bg-[#00cc6a] disabled:opacity-30
            disabled:cursor-not-allowed rounded-xl flex items-center justify-center
            transition-all flex-shrink-0 glow-green hover:scale-105">
            <Send size={15} className="text-black" />
          </button>
        </div>
        <p className="text-xs text-white/15 text-center mt-2 font-mono">
          enter to send · shift+enter for new line
        </p>
      </div>
    </div>
  );
}