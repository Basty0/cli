import type { Provider, ProviderConfig } from '../types/provider.js';

export abstract class BaseProvider implements Provider {
  abstract readonly id: Provider['id'];
  abstract readonly label: string;

  getDefaultModel(): string {
    return 'default';
  }

  async getModels(): Promise<string[]> {
    return [this.getDefaultModel()];
  }

  protected ensureApiKey(config: ProviderConfig): string {
    if (!config.apiKey) {
      throw new Error(`Missing API key for provider "${config.provider}". Run "magique-cli login".`);
    }

    return config.apiKey;
  }

  abstract sendMessage(
    messages: Parameters<Provider['sendMessage']>[0],
    config: Parameters<Provider['sendMessage']>[1],
  ): ReturnType<Provider['sendMessage']>;

  abstract streamMessage(
    messages: Parameters<Provider['streamMessage']>[0],
    config: Parameters<Provider['streamMessage']>[1],
    onToken: Parameters<Provider['streamMessage']>[2],
  ): ReturnType<Provider['streamMessage']>;
}
