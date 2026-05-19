import { getStoredConfig, saveConfig } from '../config/store.js';
import { getProvider } from '../providers/registry.js';
import { promptPassword } from '../utils/prompts.js';

export async function loginCommand(): Promise<void> {
  const current = getStoredConfig();
  if (!current.provider || !current.model) {
    throw new Error('Aucun fournisseur configuré. Lancez `magic-cli` d’abord.');
  }

  const provider = getProvider(current.provider);
  const apiKey = await promptPassword(`Entrez la clé API pour ${provider.label}`);

  saveConfig({
    provider: current.provider,
    model: current.model,
    apiKey,
  });
}
