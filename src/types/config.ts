import type { ChatMessage, ProviderId } from './provider.js';

export type StoredConfig = {
  provider?: ProviderId;
  model?: string;
  apiKey?: string;
  theme?: 'default';
  history?: ChatMessage[];
};
