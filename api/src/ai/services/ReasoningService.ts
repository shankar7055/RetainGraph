import { groqGateway } from '../gateways/GroqGateway';

export class ReasoningService {
  public async evaluateHealth(prompt: string): Promise<string> {
    const chatCompletion = await groqGateway.getChatCompletion(
      [{ role: 'system', content: prompt }],
      { type: 'json_object' }
    );
    return chatCompletion.choices[0]?.message?.content || '{}';
  }

  public async getAnswer(prompt: string): Promise<string> {
    const chatCompletion = await groqGateway.getChatCompletion(
      [{ role: 'user', content: prompt }]
    );
    return chatCompletion.choices[0]?.message?.content || '';
  }

  public async getJsonResponse(prompt: string): Promise<string> {
    const chatCompletion = await groqGateway.getChatCompletion(
      [{ role: 'user', content: prompt }],
      { type: 'json_object' }
    );
    return chatCompletion.choices[0]?.message?.content || '{}';
  }
}

export const reasoningService = new ReasoningService();
