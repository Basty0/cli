import { appendHistory } from '../config/store.js';
import { getProvider } from '../providers/registry.js';
import type { ChatMessage, ProviderConfig } from '../types/provider.js';
import { promptMultiline } from '../utils/prompts.js';
import { buildTerminalMessages, createResponseFormatter } from '../utils/response-format.js';
import { clearTerminal } from '../utils/terminal.js';
import { printAssistantPrefix } from '../utils/ui.js';
import { createSpinner } from '../utils/spinner.js';

export async function runInteractiveChat(config: ProviderConfig): Promise<void> {
  const provider = getProvider(config.provider);
  const sessionMessages: ChatMessage[] = [];

  while (true) {
    const input = await promptMultiline('vous');
    if (!input) {
      continue;
    }

    if (input === 'exit') {
      process.stdout.write('\n');
      break;
    }

    if (input === 'clear') {
      clearTerminal();
      continue;
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    sessionMessages.push(userMessage);
    appendHistory(userMessage);

    const spinner = createSpinner('magique-cli réfléchit...');
    let startedStreaming = false;
    const formatter = createResponseFormatter();

    const fullText = await provider.streamMessage(
      buildTerminalMessages(sessionMessages),
      config,
      (token) => {
        if (!startedStreaming) {
          spinner.stop();
          printAssistantPrefix();
          startedStreaming = true;
        }
        const formatted = formatter.push(token);
        if (formatted) {
          process.stdout.write(formatted);
        }
      },
    );

    if (!startedStreaming) {
      spinner.stop();
      printAssistantPrefix();
      process.stdout.write(formatter.push(fullText));
    }

    const remaining = formatter.finish();
    if (remaining) {
      process.stdout.write(remaining);
    }

    const assistantMessage: ChatMessage = { role: 'assistant', content: fullText };
    sessionMessages.push(assistantMessage);
    appendHistory(assistantMessage);
    process.stdout.write('\n\n');
  }
}

export async function askOnce(config: ProviderConfig, input: string): Promise<void> {
  const provider = getProvider(config.provider);
  const spinner = createSpinner('magique-cli réfléchit...');
  const messages: ChatMessage[] = buildTerminalMessages([{ role: 'user', content: input }]);
  let startedStreaming = false;
  const formatter = createResponseFormatter();

  await provider.streamMessage(messages, config, (token) => {
    if (!startedStreaming) {
      spinner.stop();
      printAssistantPrefix();
      startedStreaming = true;
    }
    const formatted = formatter.push(token);
    if (formatted) {
      process.stdout.write(formatted);
    }
  });

  if (!startedStreaming) {
    spinner.stop();
  }

  const remaining = formatter.finish();
  if (remaining) {
    process.stdout.write(remaining);
  }

  process.stdout.write('\n');
}
