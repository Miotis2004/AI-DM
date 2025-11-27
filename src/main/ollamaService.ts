import axios from 'axios';

const OLLAMA_API = 'http://localhost:11434';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaService {
    private model: string = 'mistral:latest'; // You can change this to any model you have

  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${OLLAMA_API}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection failed:', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${OLLAMA_API}/api/tags`);
      return response.data.models.map((m: any) => m.name);
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  setModel(model: string) {
    this.model = model;
  }

  async *generateStream(
    messages: OllamaMessage[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    const allMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await axios.post(
        `${OLLAMA_API}/api/chat`,
        {
          model: this.model,
          messages: allMessages,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim());
        
        for (const line of lines) {
          try {
            const json: OllamaStreamResponse = JSON.parse(line);
            if (json.message?.content) {
              yield json.message.content;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Ollama generation failed:', error);
      throw error;
    }
  }

  async generate(messages: OllamaMessage[], systemPrompt?: string): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.generateStream(messages, systemPrompt)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}