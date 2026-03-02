const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId:   { type: String, required: true },
  documentName: { type: String, required: true },
  content:      { type: String, required: true },
  embedding:    { type: [Number], required: true },
  chunkIndex:   { type: Number, required: true },
  createdAt:    { type: Date, default: Date.now },
});

chunkSchema.index({ documentId: 1 });
chunkSchema.index({ userId: 1 });

const Chunk = mongoose.model("Chunk", chunkSchema);

const documentSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId:  { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  size:        { type: Number },
  type:        { type: String },
  totalChunks: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["processing", "ready", "error"],
    default: "processing",
  },
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", documentSchema);

module.exports = { Document, Chunk };