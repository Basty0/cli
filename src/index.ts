import { Command } from 'commander';
import chalk from 'chalk';
import {
  getStoredConfig,
  hasConfig,
} from './config/store.js';
import { configCommand } from './commands/config.js';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { modelCommand } from './commands/model.js';
import { providerCommand } from './commands/provider.js';
import { uninstallCommand } from './commands/uninstall.js';
import { runOnboarding } from './services/onboarding-service.js';
import { askOnce, runInteractiveChat } from './services/chat-service.js';
import { isPipedInput, readStdin } from './utils/terminal.js';
import { renderWelcome } from './utils/ui.js';

const program = new Command();

async function ensureConfigured(): Promise<void> {
  if (hasConfig()) {
    return;
  }

  process.stdout.write(renderWelcome());
  await runOnboarding();
  process.stdout.write(chalk.green('Configuration enregistrée avec succès.\n'));
}

program
  .name('magic-cli')
  .description('Une CLI IA moderne multi-fournisseurs')
  .version('0.1.0');

program
  .command('login')
  .description('Définir ou mettre à jour la clé API')
  .action(async () => {
    await loginCommand();
    process.stdout.write(chalk.green('Clé API enregistrée.\n'));
  });

program
  .command('provider')
  .description('Changer de fournisseur')
  .action(async () => {
    await providerCommand();
    process.stdout.write(chalk.green('Fournisseur mis à jour.\n'));
  });

program
  .command('model')
  .description('Changer de modèle')
  .action(async () => {
    await modelCommand();
    process.stdout.write(chalk.green('Modèle mis à jour.\n'));
  });

program
  .command('config')
  .description('Afficher la configuration actuelle')
  .action(() => {
    configCommand();
  });

program
  .command('logout')
  .description('Effacer le fournisseur, le modèle, la clé API et la session')
  .action(() => {
    logoutCommand();
    process.stdout.write(chalk.green('Déconnexion effectuée.\n'));
  });

program
  .command('uninstall')
  .description('Effacer les données locales et afficher la commande de désinstallation')
  .action(() => {
    uninstallCommand();
  });

program
  .command('ask')
  .description('Poser une seule question')
  .argument('<prompt>', 'Question à poser')
  .action(async (prompt: string) => {
    await ensureConfigured();
    const config = getStoredConfig();
    if (!config.provider || !config.model) {
      throw new Error('Configuration incomplète.');
    }
    await askOnce(
      {
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
      },
      prompt,
    );
  });

program.action(async () => {
  await ensureConfigured();
  const config = getStoredConfig();

  if (!config.provider || !config.model) {
    throw new Error('Configuration incomplète.');
  }

  if (isPipedInput()) {
    const piped = await readStdin();
    if (!piped) {
      return;
    }

    await askOnce(
      {
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
      },
      piped,
    );
    return;
  }

  process.stdout.write(renderWelcome());
  await runInteractiveChat({
    provider: config.provider,
    model: config.model,
    apiKey: config.apiKey,
  });
});

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  process.stderr.write(chalk.red(`Erreur : ${message}\n`));
  process.exitCode = 1;
});
