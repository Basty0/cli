export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'ollama';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ProviderConfig = {
  provider: ProviderId;
  model: string;
  apiKey?: string;
};

export interface Provider {
  readonly id: ProviderId;
  readonly label: string;
  getDefaultModel(): string;
  getModels(): Promise<string[]>;
  sendMessage(messages: ChatMessage[], config: ProviderConfig): Promise<string>;
  streamMessage(
    messages: ChatMessage[],
    config: ProviderConfig,
    onToken: (token: string) => void,
  ): Promise<string>;
}
