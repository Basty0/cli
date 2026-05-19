import { getStoredConfig, saveConfig } from '../config/store.js';
import { getProviders } from '../providers/registry.js';
import { promptSelect, promptSelectOrCustom } from '../utils/prompts.js';

export async function providerCommand(): Promise<void> {
  const current = getStoredConfig();
  const providers = getProviders();
  const labels = providers.map((item) => item.label);
  const defaultIndex = Math.max(
    providers.findIndex((item) => item.id === current.provider),
    0,
  );
  const providerLabel = await promptSelect('Choisissez un fournisseur', labels, defaultIndex);

  const selectedProvider = providers.find((item) => item.label === providerLabel);
  if (!selectedProvider) {
    throw new Error('Fournisseur introuvable.');
  }

  const models = await selectedProvider.getModels();
  const model = await promptSelectOrCustom(
    'Choisissez un modèle',
    models,
    Math.max(models.indexOf(selectedProvider.getDefaultModel()), 0),
  );

  saveConfig({
    provider: selectedProvider.id,
    model,
    apiKey: selectedProvider.id === current.provider ? current.apiKey : undefined,
  });
}
