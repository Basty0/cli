import boxen from 'boxen';
import chalk from 'chalk';

export function renderWelcome(): string {
  return boxen(
    [
      chalk.bold.cyan('Magique CLI'),
      chalk.gray("Discutez avec votre IA directement dans le terminal."),
      '',
      `${chalk.cyan('Commandes rapides')} ${chalk.gray('exit, clear')}`,
    ].join('\n'),
    {
      borderStyle: 'round',
      padding: 1,
      margin: 1,
      borderColor: 'cyan',
      title: ' magique-cli ',
      titleAlignment: 'center',
    },
  );
}

export function formatInfo(label: string, value: string): string {
  return `${chalk.cyan(label)} ${value}`;
}

export function printAssistantPrefix(): void {
  process.stdout.write(chalk.greenBright('\nmagique-cli > '));
}

export function printUserPrefix(): void {
  process.stdout.write(chalk.cyanBright('\nvous > '));
}

export function renderCodeBlock(code: string, language?: string): string {
  const label = language ? `Code ${language}` : 'Code';
  const header = chalk.yellowBright(`\n${label}`);
  const block = boxen(code.trimEnd(), {
    borderStyle: 'round',
    borderColor: 'yellow',
    padding: {
      top: 0,
      right: 1,
      bottom: 0,
      left: 1,
    },
  });

  return `${header}\n${block}\n`;
}
