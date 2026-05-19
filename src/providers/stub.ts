import { BaseProvider } from './base.js';
import type { ChatMessage, ProviderConfig, ProviderId } from '../types/provider.js';

export class StubProvider extends BaseProvider {
  constructor(
    readonly id: ProviderId,
    readonly label: string,
    private readonly defaultModel: string,
  ) {
    super();
  }

  override getDefaultModel(): string {
    return this.defaultModel;
  }

  override async getModels(): Promise<string[]> {
    return [this.defaultModel];
  }

  async sendMessage(_: ChatMessage[], __: ProviderConfig): Promise<string> {
    throw new Error(`${this.label} provider is not implemented yet.`);
  }

  async streamMessage(
    _: ChatMessage[],
    __: ProviderConfig,
    ___: (token: string) => void,
  ): Promise<string> {
    throw new Error(`${this.label} provider is not implemented yet.`);
  }
}
