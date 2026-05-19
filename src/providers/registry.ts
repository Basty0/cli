import type { Provider, ProviderId } from '../types/provider.js';
import { OpenAIProvider } from './openai.js';
import { StubProvider } from './stub.js';

const providers: Provider[] = [
  new OpenAIProvider(),
  new StubProvider('anthropic', 'Anthropic', 'claude-sonnet-4-0'),
  new StubProvider('gemini', 'Gemini', 'gemini-2.5-flash'),
  new StubProvider('groq', 'Groq', 'llama-3.3-70b-versatile'),
  new StubProvider('openrouter', 'OpenRouter', 'openai/gpt-4.1-mini'),
  new StubProvider('ollama', 'Ollama', 'llama3.2'),
];

export function getProviders(): Provider[] {
  return providers;
}

export function getProvider(providerId: ProviderId): Provider {
  const provider = providers.find((item) => item.id === providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  return provider;
}
