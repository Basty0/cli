import { getStoredConfig, saveConfig } from '../config/store.js';
import { getProvider } from '../providers/registry.js';
import { promptSelectOrCustom } from '../utils/prompts.js';

export async function modelCommand(): Promise<void> {
  const current = getStoredConfig();
  if (!current.provider) {
    throw new Error('Aucun fournisseur configuré. Lancez `magique-cli` d’abord.');
  }

  const provider = getProvider(current.provider);
  const models = await provider.getModels();
  const defaultIndex = Math.max(models.indexOf(current.model ?? provider.getDefaultModel()), 0);
  const model = await promptSelectOrCustom('Choisissez un modèle', models, defaultIndex);

  saveConfig({
    provider: current.provider,
    model,
    apiKey: current.apiKey,
  });
}
