import { getConversation } from '../utils/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import DocumentPanel from '../components/DocumentPanel';
import useChat from '../hooks/useChat';

export default function Home() {
  const {
    messages, loading, send, reset,
    setMessages, setConversationId, conversationId
  } = useChat();

  const handleSelect = async (id) => {
    try {
      const res = await getConversation(id);
      setMessages(res.data.messages || []);
      setConversationId(id);
    } catch {}
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar activeId={conversationId} onSelect={handleSelect} onNew={reset} />
      <ChatWindow messages={messages} loading={loading} onSend={send} />
      <DocumentPanel />
    </div>
  );
}