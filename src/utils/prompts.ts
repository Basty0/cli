import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import chalk from 'chalk';

function createPrompt() {
  return createInterface({ input, output });
}

export async function promptInput(message: string): Promise<string> {
  const rl = createPrompt();
  try {
    return (await rl.question(`${chalk.cyan(message)}\n${chalk.cyan('> ' )}`)).trim();
  } finally {
    rl.close();
  }
}

export async function promptPassword(message: string): Promise<string> {
  return promptInput(message);
}

export async function promptSelect(message: string, choices: string[], defaultIndex = 0): Promise<string> {
  const lines = choices
    .map((choice, index) => {
      const marker = index === defaultIndex ? chalk.cyan('●') : chalk.gray('○');
      const number = chalk.gray(`${index + 1}.`);
      return `${marker} ${number} ${choice}`;
    })
    .join('\n');

  const answer = await promptInput(`${message}\n${lines}\nEntrez un numéro`);
  if (!answer) {
    return choices[defaultIndex] ?? choices[0] ?? '';
  }

  const index = Number.parseInt(answer, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= choices.length) {
    throw new Error('Sélection invalide.');
  }

  return choices[index]!;
}

export async function promptSelectOrCustom(
  message: string,
  choices: string[],
  defaultIndex = 0,
): Promise<string> {
  const customLabel = 'Entrer un autre modèle';
  const value = await promptSelect(message, [...choices, customLabel], defaultIndex);

  if (value !== customLabel) {
    return value;
  }

  const customValue = await promptInput('Entrez l’identifiant exact du modèle');
  if (!customValue) {
    throw new Error('Nom de modèle invalide.');
  }

  return customValue;
}

export async function promptMultiline(message: string): Promise<string> {
  const rl = createPrompt();
  const lines: string[] = [];

  output.write(`${chalk.cyanBright(`\n${message} >`)}\n`);
  output.write(`${chalk.gray("Terminez votre message avec un simple '.' sur une ligne vide.")}\n`);

  try {
    while (true) {
      const line = await rl.question(chalk.cyan('... '));
      if (line.trim() === '.') {
        break;
      }
      lines.push(line);
    }
  } finally {
    rl.close();
  }

  return lines.join('\n').trim();
}
