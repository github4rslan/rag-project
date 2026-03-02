import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function MessageBubble({ message }) {
  const [openSource, setOpenSource] = useState(null);
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
        text-sm flex-shrink-0 mt-1 font-mono
        ${isUser
          ? 'bg-[#00ff88] text-black font-bold'
          : 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]'
        }`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div className="flex flex-col gap-2 max-w-[75%]">
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-white rounded-tr-sm font-mono'
            : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm'
          }`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code: ({ children }) => (
                  <code className="bg-[#00ff88]/10 text-[#00ff88] px-1.5 py-0.5
                  rounded text-xs font-mono border border-[#00ff88]/20">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-black border border-[#00ff88]/20 rounded-xl
                  p-3 overflow-x-auto my-2 text-xs font-mono">
                    {children}
                  </pre>
                ),
                p:  ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                strong: ({ children }) => <strong className="text-[#00ff88] font-semibold">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Sources */}
        {message.sources?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((src, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenSource(openSource === i ? null : i)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#00ff88]/5
                  border border-[#00ff88]/20 hover:border-[#00ff88]/50
                  text-[#00ff88]/60 hover:text-[#00ff88] rounded-full
                  text-xs font-mono transition-all">
                  <FileText size={11} />
                  {src.documentName}
                  {openSource === i ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {openSource === i && (
                  <div className="mt-2 p-3 bg-black border border-[#00ff88]/20
                  rounded-xl text-xs font-mono text-white/40 leading-relaxed max-w-sm">
                    {src.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}