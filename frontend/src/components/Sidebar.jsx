import { useEffect, useState } from 'react';
import { Plus, Trash2, MessageSquare, Terminal } from 'lucide-react';
import { getConversations, deleteConversation } from '../utils/api';

export default function Sidebar({ activeId, onSelect, onNew }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => { fetchConversations(); }, [activeId]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.conversationId !== id));
    if (activeId === id) onNew();
  };

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <button onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-2.5
          bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30
          hover:border-[#00ff88]/60 text-[#00ff88] text-sm font-mono
          rounded-xl transition-all glow-green">
          <Plus size={16} />
          new_chat()
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Terminal size={11} className="text-[#00ff88]" />
        <p className="text-xs font-mono text-white/20 uppercase tracking-widest">
          history
        </p>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
        {conversations.length === 0 && (
          <p className="text-center text-white/15 text-xs mt-8 font-mono">
            // no conversations yet
          </p>
        )}
        {conversations.map((conv) => (
          <div key={conv.conversationId}
            onClick={() => onSelect(conv.conversationId)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl
            cursor-pointer transition-all text-sm font-mono border
            ${activeId === conv.conversationId
              ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]'
              : 'hover:bg-white/5 text-white/30 hover:text-white/70 border-transparent'
            }`}>
            <MessageSquare size={13} className="flex-shrink-0" />
            <span className="flex-1 truncate text-xs">{conv.title}</span>
            <button onClick={(e) => handleDelete(e, conv.conversationId)}
              className="opacity-0 group-hover:opacity-100 text-white/20
              hover:text-red-400 transition-all p-0.5 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}