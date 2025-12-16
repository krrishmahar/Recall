
import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Generate embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'nvidia/nemotron-nano-9b-v2:free',
    input: text,
  });

  return response.data[0].embedding;
}

// Classify memory with AI
export async function classifyMemory(title: string, description: string, type: string) {
  const prompt = `Analyze this ${type} memory and provide:
1. A concise summary (2-3 sentences)
2. Category (technical/process/product/people)
3. Root cause (if failure type)
4. Key lessons learned (3-5 bullet points)

Title: ${title}
Description: ${description}

Respond in JSON format:
{
  "summary": "...",
  "category": "...",
  "rootCause": "..." (only for failures),
  "lessons": ["...", "..."]
}`;

  const response = await openai.chat.completions.create({
    model: 'nvidia/nemotron-nano-9b-v2:free',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

// Answer questions with RAG
export async function generateAnswer(
  question: string,
  context: string[]
): Promise<string> {

  const prompt = `You are Chronicle, a team memory assistant. Answer the question based on past memories.

Context (past memories):
${context.join('\n\n---\n\n')}

Question: ${question}

Provide a clear, helpful answer citing specific memories. If no relevant context exists, say so.`;

  const response = await openai.chat.completions.create({
    model: 'nvidia/nemotron-nano-9b-v2:free',
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  });

  return response.choices[0].message.content || 'No answer generated.';
}

// Re-analyze memory for reactivation
export async function reanalyzeMemory(
  originalMemory: any,
  currentContext: string
): Promise<string> {
  const prompt = `A memory from the past is being reactivated. Analyze if it's still relevant.

Original Memory (from ${originalMemory.createdAt}):
Title: ${originalMemory.title}
Description: ${originalMemory.description}
Type: ${originalMemory.type}

Current Context: ${currentContext}

Provide:
1. Relevance assessment (still relevant/outdated/partially relevant)
2. Updated insights
3. Recommended actions

Format as a helpful notification message.`;

  const response = await openai.chat.completions.create({
    model: 'nvidia/nemotron-nano-9b-v2:free',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content || 'No analysis available.';
}