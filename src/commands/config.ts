import chalk from 'chalk';
import { getStoredConfig } from '../config/store.js';
import { formatInfo } from '../utils/ui.js';

export function configCommand(): void {
  const config = getStoredConfig();
  const lines = [
    formatInfo('Fournisseur :', config.provider ?? chalk.gray('non défini')),
    formatInfo('Modèle :', config.model ?? chalk.gray('non défini')),
    formatInfo('Clé API :', config.apiKey ? '********' : chalk.gray('non définie')),
  ];

  process.stdout.write(`${lines.join('\n')}\n`);
}
