const { v4: uuidv4 } = require("uuid");
const { Document, Chunk } = require("../models/Document");
const { generateEmbedding } = require("../utils/openai");
const { chunkText, extractText } = require("../utils/chunker");

// Upload and process document
async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file       = req.file;
    const documentId = uuidv4();
    const userId     = req.user._id;

    await Document.create({
      userId,
      documentId,
      name:   file.originalname,
      size:   file.size,
      type:   file.mimetype,
      status: "processing",
    });

    // Process in background
    processDocument(documentId, file, userId).catch(async (err) => {
      console.error("Processing error:", err);
      await Document.findOneAndUpdate({ documentId }, { status: "error" });
    });

    res.status(201).json({
      message:    "Document uploaded, processing started",
      documentId,
      name:       file.originalname,
      status:     "processing",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
}

async function processDocument(documentId, file, userId) {
  const text = await extractText(file);
  if (!text || text.trim().length === 0) {
    throw new Error("Could not extract text from document");
  }

  // ✅ await added — LangChain chunker is async
  const chunks = await chunkText(text);
  console.log(`📄 Processing ${chunks.length} chunks for ${file.originalname}`);

  const chunkDocs = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    chunkDocs.push({
      userId,
      documentId,
      documentName: file.originalname,
      content:      chunks[i],
      embedding,
      chunkIndex:   i,
    });

    if (i % 10 === 0 && i > 0) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  await Chunk.insertMany(chunkDocs);
  await Document.findOneAndUpdate(
    { documentId },
    { status: "ready", totalChunks: chunks.length }
  );

  console.log(`✅ Done: ${file.originalname}`);
}

// Get only THIS user's documents
async function getDocuments(req, res) {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

// Delete only if it belongs to THIS user
async function deleteDocument(req, res) {
  try {
    const { documentId } = req.params;

    const doc = await Document.findOne({ documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    await Document.findOneAndDelete({ documentId });
    await Chunk.deleteMany({ documentId });
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
}

module.exports = { uploadDocument, getDocuments, deleteDocument };