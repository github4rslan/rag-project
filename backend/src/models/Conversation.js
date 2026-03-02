const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  sources: [
    {
      documentName: String,
      content:      String,
      chunkIndex:   Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: String, required: true, unique: true },
  title:          { type: String, default: "New Conversation" },
  messages:       [messageSchema],
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now },
});

conversationSchema.index({ userId: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Conversation };