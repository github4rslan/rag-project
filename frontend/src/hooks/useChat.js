import { useState } from 'react';
import { sendMessage } from '../utils/api';

export default function useChat() {
  const [messages, setMessages]               = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [conversationId, setConversationId]   = useState(null);

  const send = async (text) => {
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await sendMessage(text, conversationId);
      const { conversationId: newId, message, sources } = res.data;
      if (!conversationId) setConversationId(newId);
      setMessages((prev) => [...prev, { role: 'assistant', content: message, sources }]);
      return newId;
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Cannot connect to server. Is your backend running?', sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setConversationId(null);
  };

  return { messages, loading, conversationId, send, reset, setMessages, setConversationId };
}