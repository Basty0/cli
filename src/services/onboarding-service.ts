import { saveConfig } from '../config/store.js';
import { getProviders } from '../providers/registry.js';
import { promptPassword, promptSelect, promptSelectOrCustom } from '../utils/prompts.js';

export async function runOnboarding(): Promise<void> {
  const providers = getProviders();
  const providerLabels = providers.map((provider) => provider.label);
  const providerLabel = await promptSelect('Choisissez un fournisseur', providerLabels);
  const selectedProvider = providers.find((item) => item.label === providerLabel);

  if (!selectedProvider) {
    throw new Error('Impossible de résoudre le fournisseur sélectionné.');
  }

  const models = await selectedProvider.getModels();
  const defaultModelIndex = Math.max(models.indexOf(selectedProvider.getDefaultModel()), 0);
  const model = await promptSelectOrCustom('Choisissez un modèle', models, defaultModelIndex);
  const apiKey = selectedProvider.id === 'ollama' ? undefined : await promptPassword('Entrez la clé API');

  saveConfig({ provider: selectedProvider.id, model, apiKey });
}
