const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { ChatPromptTemplate }           = require("@langchain/core/prompts");
const { StringOutputParser }           = require("@langchain/core/output_parsers");
const { RunnableSequence }             = require("@langchain/core/runnables");

// LangChain Embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName:    "text-embedding-ada-002",
});

// LangChain Chat model
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName:    "gpt-4o-mini",
  temperature:  0.2,
  maxTokens:    1500,
});

// Generate embedding
async function generateEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}

// Chat with context
async function chatWithContext(history, context, userQuery) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI assistant that answers questions based on the provided document context.

INSTRUCTIONS:
- Answer ONLY based on the context below
- If the answer is not in the context, say "I couldn't find relevant information in the uploaded documents."
- Be concise, clear and accurate
- Format responses with markdown for readability

CONTEXT FROM DOCUMENTS:
{context}`,
    ],
    ...history.map((m) => [
      m.role === "user" ? "human" : "assistant",
      m.content
    ]),
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke({
    context,
    question: userQuery,
  });

  return response;
}

module.exports = { generateEmbedding, chatWithContext };