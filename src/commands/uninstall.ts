import chalk from 'chalk';
import { clearConfig } from '../config/store.js';

export function uninstallCommand(): void {
  clearConfig();
  process.stdout.write('Configuration et cache supprimés.\n');
  process.stdout.write(chalk.gray('Exécutez `npm uninstall -g magique-cli` pour retirer le package globalement.\n'));
}
