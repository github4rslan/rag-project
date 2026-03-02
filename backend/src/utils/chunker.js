const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

// LangChain smart text splitter
async function chunkText(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:    1000,
    chunkOverlap: 200,
    separators:   ["\n\n", "\n", ".", "!", "?", ",", " "],
  });

  const chunks = await splitter.splitText(text);
  return chunks.filter((c) => c.trim().length > 20);
}

// Extract text from uploaded file
async function extractText(file) {
  const mimeType = file.mimetype;

  if (mimeType === "application/pdf") {
    const pdfParse = require("pdf-parse");
    const data     = await pdfParse(file.buffer);
    return data.text;
  }

  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return file.buffer.toString("utf-8");
  }

  if (mimeType === "application/json") {
    const json = JSON.parse(file.buffer.toString("utf-8"));
    return JSON.stringify(json, null, 2);
  }

  return file.buffer.toString("utf-8");
}

module.exports = { chunkText, extractText };