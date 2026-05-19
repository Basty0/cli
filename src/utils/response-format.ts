import type { ChatMessage } from '../types/provider.js';
import chalk from 'chalk';
import { renderCodeBlock } from './ui.js';

const TERMINAL_SYSTEM_PROMPT = [
  'Tu réponds dans un terminal.',
  'Par défaut, évite le Markdown décoratif.',
  'Si tu donnes du code, préfère un bloc clair et compact.',
  'Fais des réponses courtes, propres et lisibles dans un terminal.',
  'Ajoute des retours à la ligne naturels entre les idées.',
  'Quand il y a plusieurs points, utilise des listes simples.',
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
  const proseWidth = Math.max(48, Math.min((process.stdout.columns ?? 80) - 4, 92));

  const wrapLine = (line: string, width: number): string[] => {
    const trimmed = line.trim();
    if (!trimmed) {
      return [''];
    }

    const indentMatch = line.match(/^(\s*[-*]\s+|\s*\d+\.\s+|\s+)/);
    const indent = indentMatch?.[0] ?? '';
    const content = trimmed.startsWith(indent.trim()) ? trimmed.slice(indent.trim().length).trimStart() : trimmed;
    const words = content.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    const nextIndent = indent ? ' '.repeat(indent.length) : '';
    let current = indent;

    for (const word of words) {
      const candidate = current.trim().length === 0 ? `${current}${word}` : `${current} ${word}`;
      if (candidate.length <= width || current.trim().length === 0) {
        current = candidate;
        continue;
      }

      lines.push(current);
      current = `${nextIndent}${word}`;
    }

    if (current) {
      lines.push(current);
    }

    return lines;
  };

  const formatProse = (text: string): string => {
    const normalized = text
      .replace(/\s+([?!:;,])/g, '$1')
      .replace(/\s+-\s+/g, '\n- ')
      .replace(/([.?!])\s+([A-ZÀ-ÖØ-Þ])/g, '$1\n$2')
      .replace(/:\s+(-\s+)/g, ':\n$1');

    return normalized
      .split('\n')
      .flatMap((line) => wrapLine(line, proseWidth))
      .join('\n');
  };

  const flushProseBuffer = (force = false): string => {
    if (!buffer) {
      return '';
    }

    const newlineIndex = buffer.lastIndexOf('\n');
    const sentenceBreakRegex = /([.?!:])\s+(?=[A-ZÀ-ÖØ-Þ0-9-])/g;
    let splitIndex = newlineIndex;
    let match: RegExpExecArray | null = null;

    for (const current of buffer.matchAll(sentenceBreakRegex)) {
      match = current;
    }

    if (match && (match.index ?? -1) > splitIndex) {
      splitIndex = (match.index ?? 0) + match[0].length - 1;
    }

    if (!force && splitIndex < 0 && buffer.length < proseWidth) {
      return '';
    }

    const chunk = splitIndex >= 0 ? buffer.slice(0, splitIndex + 1) : buffer;
    buffer = splitIndex >= 0 ? buffer.slice(splitIndex + 1).trimStart() : '';
    return formatProse(chunk);
  };

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

  return {
    push(chunk: string): string {
      if (insideCodeFence) {
        buffer += chunk;
        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';

        return parts
          .map((line) => sanitizeLine(line))
          .filter((line, index, array) => !(line === '' && array[index - 1] === ''))
          .join('\n');
      }

      const codeFenceIndex = chunk.indexOf('```');
      if (codeFenceIndex >= 0) {
        const before = chunk.slice(0, codeFenceIndex);
        const after = chunk.slice(codeFenceIndex);
        buffer += before;
        const prose = flushProseBuffer(true);
        buffer = '';
        buffer += after;

        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';
        const formattedCode = parts
          .map((line) => sanitizeLine(line))
          .filter((line, index, array) => !(line === '' && array[index - 1] === ''))
          .join('\n');

        return [prose, formattedCode].filter(Boolean).join('\n');
      }

      buffer += chunk;
      return flushProseBuffer(false);
    },
    finish(): string {
      let tail = '';
      if (!insideCodeFence) {
        tail += flushProseBuffer(true);
      } else {
        tail += sanitizeLine(buffer);
      }

      if (insideCodeFence && currentCodeLines.length > 0) {
        tail += renderCodeBlock(currentCodeLines.join('\n'), currentCodeLanguage);
        insideCodeFence = false;
        currentCodeLanguage = '';
        currentCodeLines = [];
      }
      buffer = '';
      return tail.trimEnd();
    },
  };
}
