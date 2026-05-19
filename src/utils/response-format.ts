import type { ChatMessage } from '../types/provider.js';
import chalk from 'chalk';
import { renderCodeBlock } from './ui.js';

const TERMINAL_SYSTEM_PROMPT = [
  'Tu réponds dans un terminal.',
  'Par défaut, évite le Markdown décoratif.',
  'Si tu donnes du code, préfère un bloc clair et compact.',
  'Fais des réponses courtes, propres et lisibles dans un terminal.',
  'Tu peux utiliser des listes simples si cela aide la lecture.',
].join(' ');

export function buildTerminalMessages(messages: ChatMessage[]): ChatMessage[] {
  return [
    {
      role: 'system',
      content: TERMINAL_SYSTEM_PROMPT,
    },
    ...messages,
  ];
}

export function createResponseFormatter() {
  let buffer = '';
  let insideCodeFence = false;
  let currentCodeLanguage = '';
  let currentCodeLines: string[] = [];

  const sanitizeLine = (line: string): string => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!insideCodeFence) {
        insideCodeFence = true;
        currentCodeLanguage = trimmed.slice(3).trim();
        currentCodeLines = [];
        return '';
      }

      insideCodeFence = false;
      const code = currentCodeLines.join('\n');
      const language = currentCodeLanguage;
      currentCodeLanguage = '';
      currentCodeLines = [];
      return renderCodeBlock(code, language);
    }

    if (insideCodeFence) {
      currentCodeLines.push(line);
      return '';
    }

    let output = line
      .replace(/^#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1');

    output = output.replace(/`([^`]+)`/g, (_, code: string) => chalk.yellow(code));

    return output;
  };

  const flushCompleteLines = (): string => {
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    return parts
      .map((line) => sanitizeLine(line))
      .filter((line, index, array) => !(line === '' && array[index - 1] === ''))
      .join('\n');
  };

  return {
    push(chunk: string): string {
      buffer += chunk;
      return flushCompleteLines();
    },
    finish(): string {
      let tail = sanitizeLine(buffer);
      if (insideCodeFence && currentCodeLines.length > 0) {
        tail += renderCodeBlock(currentCodeLines.join('\n'), currentCodeLanguage);
        insideCodeFence = false;
        currentCodeLanguage = '';
        currentCodeLines = [];
      }
      buffer = '';
      return tail;
    },
  };
}
