import Conf from 'conf';
import path from 'node:path';
import type { StoredConfig } from '../types/config.js';
import type { ChatMessage, ProviderId } from '../types/provider.js';

const store = new Conf<StoredConfig>({
  projectName: 'magique-cli',
  cwd: process.env.MAGIQUE_CONFIG_DIR
    ? path.resolve(process.env.MAGIQUE_CONFIG_DIR)
    : undefined,
  defaults: {
    theme: 'default',
    history: [],
  },
});

export function getStoredConfig(): StoredConfig {
  return {
    provider: store.get('provider'),
    model: store.get('model'),
    apiKey: store.get('apiKey'),
    theme: store.get('theme', 'default'),
    history: store.get('history', []),
  };
}

export function saveConfig(data: {
  provider: ProviderId;
  model: string;
  apiKey?: string;
}): void {
  store.set(data);
}

export function clearConfig(): void {
  store.clear();
}

export function appendHistory(message: ChatMessage): void {
  const history = store.get('history', []);
  store.set('history', [...history, message].slice(-100));
}

export function clearHistory(): void {
  store.set('history', []);
}

export function hasConfig(): boolean {
  const config = getStoredConfig();
  return Boolean(config.provider && config.model);
}
