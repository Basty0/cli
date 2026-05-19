import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import type { ChatMessage, ProviderConfig } from '../types/provider.js';

export class OpenAIProvider extends BaseProvider {
  readonly id = 'openai' as const;
  readonly label = 'OpenAI';

  override getDefaultModel(): string {
    return 'gpt-5.4-mini';
  }

  override async getModels(): Promise<string[]> {
    return [
      'gpt-5.5',
      'gpt-5.4',
      'gpt-5.4-mini',
      'gpt-5.4-nano',
      'gpt-5.1',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
    ];
  }

  private createClient(config: ProviderConfig): OpenAI {
    return new OpenAI({ apiKey: this.ensureApiKey(config) });
  }

  private toChatMessages(messages: ChatMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }

  async sendMessage(messages: ChatMessage[], config: ProviderConfig): Promise<string> {
    const client = this.createClient(config);
    const response = await client.chat.completions.create({
      model: config.model,
      messages: this.toChatMessages(messages),
    });

    return response.choices[0]?.message?.content ?? '';
  }

  async streamMessage(
    messages: ChatMessage[],
    config: ProviderConfig,
    onToken: (token: string) => void,
  ): Promise<string> {
    const client = this.createClient(config);
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: this.toChatMessages(messages),
      stream: true,
    });

    let fullText = '';

    for await (const event of stream) {
      const delta = event.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onToken(delta);
      }
    }

    return fullText;
  }
}
