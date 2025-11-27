import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic | null = null;
  private apiKey: string = '';
  private currentModel: string = 'claude-3-5-sonnet-20241022';

  setApiKey(key: string) {
    this.apiKey = key;
    if (key) {
      this.client = new Anthropic({
        apiKey: key,
      });
    } else {
      this.client = null;
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  setModel(model: string) {
    this.currentModel = model;
  }

  getModel(): string {
    return this.currentModel;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Simple test to see if API key works
      const message = await this.client.messages.create({
        model: this.currentModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Claude API test failed:', error);
      return false;
    }
  }

  async *generateStream(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client) {
      throw new Error('Claude API key not set');
    }

    try {
      const anthropicMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      const stream = await this.client.messages.stream({
        model: this.currentModel,
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          yield chunk.delta.text;
        }
      }
    } catch (error: any) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ];
  }
}

export const claudeService = new ClaudeService();
