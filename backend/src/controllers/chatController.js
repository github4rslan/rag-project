const { v4: uuidv4 } = require("uuid");
const { Chunk }        = require("../models/Document");
const { Conversation } = require("../models/Conversation");
const { generateEmbedding, chatWithContext } = require("../utils/openai");
const {
  getCache, setCache,
  makeCacheKey, CACHE_TTL,
} = require("../utils/cache");

const TOP_K = 5;

async function chat(req, res) {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const convId = conversationId || uuidv4();
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({ conversationId, userId });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    } else {
      conversation = await Conversation.create({
        userId,
        conversationId: convId,
        title:    message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        messages: [],
      });
    }

    // ✅ Step 1: Check cache first
    const cacheKey = makeCacheKey("chat", userId.toString(), message);
    const cached   = await getCache(cacheKey);

    if (cached) {
      // Return cached response instantly!
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;

      // Still save to conversation history
      conversation.messages.push({ role: "user",      content: message });
      conversation.messages.push({ role: "assistant", content: parsed.message, sources: parsed.sources });
      conversation.updatedAt = new Date();
      await conversation.save();

      return res.json({
        conversationId: convId,
        message:        parsed.message,
        sources:        parsed.sources,
        fromCache:      true, // 👈 tells frontend it was cached
      });
    }

    // Step 2: Embed the query
    // Check embedding cache first
    const embeddingKey = makeCacheKey("embedding", message);
    let queryEmbedding = await getCache(embeddingKey);

    if (queryEmbedding) {
      queryEmbedding = typeof queryEmbedding === "string"
        ? JSON.parse(queryEmbedding) : queryEmbedding;
    } else {
      queryEmbedding = await generateEmbedding(message);
      await setCache(embeddingKey, queryEmbedding, CACHE_TTL.EMBEDDING);
    }

    // Step 3: Check if user has documents
    const docCount = await Chunk.countDocuments({ userId });
    if (docCount === 0) {
      const aiResponse = "You haven't uploaded any documents yet. Please upload some documents first!";
      conversation.messages.push({ role: "user",      content: message });
      conversation.messages.push({ role: "assistant", content: aiResponse, sources: [] });
      conversation.updatedAt = new Date();
      await conversation.save();
      return res.json({ conversationId: convId, message: aiResponse, sources: [] });
    }

    // Step 4: MongoDB Atlas Vector Search
    const ranked = await Chunk.aggregate([
      {
        $vectorSearch: {
          index:         "vector_index",
          path:          "embedding",
          queryVector:   queryEmbedding,
          numCandidates: 100,
          limit:         TOP_K,
          filter:        { userId: userId },
        },
      },
      {
        $project: {
          content:      1,
          documentName: 1,
          chunkIndex:   1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // Step 5: Build context
    const context = ranked
      .map((r, i) => `[Source ${i + 1} - ${r.documentName}]:\n${r.content}`)
      .join("\n\n---\n\n");

    // Step 6: Build history
    const history = conversation.messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    // Step 7: Get AI response
    const aiResponse = await chatWithContext(history, context, message);

    const sources = ranked.map((r) => ({
      documentName: r.documentName,
      content:      r.content.slice(0, 200) + "...",
      chunkIndex:   r.chunkIndex,
    }));

    // Step 8: ✅ Save to cache
    await setCache(cacheKey, { message: aiResponse, sources }, CACHE_TTL.CHAT);

    // Step 9: Save to conversation
    conversation.messages.push({ role: "user",      content: message });
    conversation.messages.push({ role: "assistant", content: aiResponse, sources });
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({ conversationId: convId, message: aiResponse, sources });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
}

// Get only THIS user's conversations
async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find(
      { userId: req.user._id },
      { conversationId: 1, title: 1, createdAt: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

// Get single conversation
async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({
      conversationId,
      userId: req.user._id,
    });
    if (!conversation) return res.status(404).json({ error: "Not found" });
    res.json(conversation);
  } catch {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
}

// Delete conversation
async function deleteConversation(req, res) {
  try {
    const { conversationId } = req.params;
    await Conversation.findOneAndDelete({
      conversationId,
      userId: req.user._id,
    });
    res.json({ message: "Conversation deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
}

module.exports = { chat, getConversations, getConversation, deleteConversation };