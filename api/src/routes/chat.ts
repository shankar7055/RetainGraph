import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { cogneeService } from '../services/cognee';
import { groq } from '../services/groq';
import { authenticate } from '../middleware/tenant';

export const chatRouter = Router();

const chatPayloadSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
});

// POST endpoint for streaming chat completions
chatRouter.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = chatPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { question } = result.data;

    // 1. Fetch Context from Cognee
    let contextStr = "";
    try {
      contextStr = await cogneeService.searchContext(question, tenantId);
    } catch (err: any) {
      console.error('Failed to retrieve context:', err);
      // Return a distinctive error message if the graph isn't ready
      if (err.message.includes('not ready yet')) {
        return res.status(503).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Failed to retrieve context from knowledge graph.' });
    }

    // 2. Construct System Prompt
    const systemPrompt = `You are a helpful Customer Success AI Assistant. 
You must answer the user's question ONLY based on the following account history context. 
If the answer is not contained within the context, explicitly say you do not have enough information. 
Do not make up or hallucinate information.

CONTEXT:
${contextStr}
`;

    // 3. Make streaming call to Groq API
    const chatCompletionStream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'openai/gpt-oss-20b',
      stream: true,
      temperature: 0.2,
    });

    // 4. Stream chunks back to client
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of chatCompletionStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    // Append context summary to the end of the stream
    res.write(`\n\n--- Context Summary ---\n${contextStr.substring(0, 300)}...`);

    res.end();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during chat completion.' });
    } else {
      res.end('\n[Error occurred during stream generation]');
    }
  }
});

// POST endpoint for naive chat completion (Comparison Baseline)
chatRouter.post('/chat/naive', authenticate, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const result = chatPayloadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { question } = result.data;

    // 1. Fetch Naive Context (only the latest interaction) from Prisma
    const latestInteraction = await prisma.clientInteraction.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    const contextStr = latestInteraction ? latestInteraction.payload : "No interactions found.";

    // 2. Construct System Prompt
    const systemPrompt = `You are a helpful Customer Success AI Assistant. 
You must answer the user's question ONLY based on the following account history context. 
If the answer is not contained within the context, explicitly say you do not have enough information. 
Do not make up or hallucinate information.

CONTEXT:
${contextStr}
`;

    // 3. Make streaming call to Groq API
    const chatCompletionStream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'openai/gpt-oss-20b',
      stream: true,
      temperature: 0.2,
    });

    // 4. Stream chunks back to client
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of chatCompletionStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    // Append context summary
    res.write(`\n\n--- Context Summary ---\n${contextStr}`);

    res.end();
  } catch (error) {
    console.error('Error in /api/chat/naive:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during chat completion.' });
    } else {
      res.end('\n[Error occurred during stream generation]');
    }
  }
});
