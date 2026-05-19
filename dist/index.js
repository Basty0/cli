#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import chalk6 from "chalk";

// src/config/store.ts
import Conf from "conf";
import path from "path";
var store = new Conf({
  projectName: "magique-cli",
  cwd: process.env.MAGIQUE_CONFIG_DIR ? path.resolve(process.env.MAGIQUE_CONFIG_DIR) : void 0,
  defaults: {
    theme: "default",
    history: []
  }
});
function getStoredConfig() {
  return {
    provider: store.get("provider"),
    model: store.get("model"),
    apiKey: store.get("apiKey"),
    theme: store.get("theme", "default"),
    history: store.get("history", [])
  };
}
function saveConfig(data) {
  store.set(data);
}
function clearConfig() {
  store.clear();
}
function appendHistory(message) {
  const history = store.get("history", []);
  store.set("history", [...history, message].slice(-100));
}
function hasConfig() {
  const config = getStoredConfig();
  return Boolean(config.provider && config.model);
}

// src/commands/config.ts
import chalk2 from "chalk";

// src/utils/ui.ts
import boxen from "boxen";
import chalk from "chalk";
function renderWelcome() {
  return boxen(
    [
      chalk.bold.cyan("Magique CLI"),
      chalk.gray("Discutez avec votre IA directement dans le terminal."),
      "",
      `${chalk.cyan("Commandes rapides")} ${chalk.gray("exit, clear")}`
    ].join("\n"),
    {
      borderStyle: "round",
      padding: 1,
      margin: 1,
      borderColor: "cyan",
      title: " magic-cli ",
      titleAlignment: "center"
    }
  );
}
function formatInfo(label, value) {
  return `${chalk.cyan(label)} ${value}`;
}
function printAssistantPrefix() {
  process.stdout.write(chalk.greenBright("\nmagique-cli > "));
}
function renderCodeBlock(code, language) {
  const label = language ? `Code ${language}` : "Code";
  const header = chalk.yellowBright(`
${label}`);
  const block = boxen(code.trimEnd(), {
    borderStyle: "round",
    borderColor: "yellow",
    padding: {
      top: 0,
      right: 1,
      bottom: 0,
      left: 1
    }
  });
  return `${header}
${block}
`;
}

// src/commands/config.ts
function configCommand() {
  const config = getStoredConfig();
  const lines = [
    formatInfo("Fournisseur :", config.provider ?? chalk2.gray("non d\xE9fini")),
    formatInfo("Mod\xE8le :", config.model ?? chalk2.gray("non d\xE9fini")),
    formatInfo("Cl\xE9 API :", config.apiKey ? "********" : chalk2.gray("non d\xE9finie"))
  ];
  process.stdout.write(`${lines.join("\n")}
`);
}

// src/providers/openai.ts
import OpenAI from "openai";

// src/providers/base.ts
var BaseProvider = class {
  getDefaultModel() {
    return "default";
  }
  async getModels() {
    return [this.getDefaultModel()];
  }
  ensureApiKey(config) {
    if (!config.apiKey) {
      throw new Error(`Missing API key for provider "${config.provider}". Run "magic-cli login".`);
    }
    return config.apiKey;
  }
};

// src/providers/openai.ts
var OpenAIProvider = class extends BaseProvider {
  id = "openai";
  label = "OpenAI";
  getDefaultModel() {
    return "gpt-5.4-mini";
  }
  async getModels() {
    return [
      "gpt-5.5",
      "gpt-5.4",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
      "gpt-5.1",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini"
    ];
  }
  createClient(config) {
    return new OpenAI({ apiKey: this.ensureApiKey(config) });
  }
  toChatMessages(messages) {
    return messages.map((message) => ({
      role: message.role,
      content: message.content
    }));
  }
  async sendMessage(messages, config) {
    const client = this.createClient(config);
    const response = await client.chat.completions.create({
      model: config.model,
      messages: this.toChatMessages(messages)
    });
    return response.choices[0]?.message?.content ?? "";
  }
  async streamMessage(messages, config, onToken) {
    const client = this.createClient(config);
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: this.toChatMessages(messages),
      stream: true
    });
    let fullText = "";
    for await (const event of stream) {
      const delta = event.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onToken(delta);
      }
    }
    return fullText;
  }
};

// src/providers/stub.ts
var StubProvider = class extends BaseProvider {
  constructor(id, label, defaultModel) {
    super();
    this.id = id;
    this.label = label;
    this.defaultModel = defaultModel;
  }
  id;
  label;
  defaultModel;
  getDefaultModel() {
    return this.defaultModel;
  }
  async getModels() {
    return [this.defaultModel];
  }
  async sendMessage(_, __) {
    throw new Error(`${this.label} provider is not implemented yet.`);
  }
  async streamMessage(_, __, ___) {
    throw new Error(`${this.label} provider is not implemented yet.`);
  }
};

// src/providers/registry.ts
var providers = [
  new OpenAIProvider(),
  new StubProvider("anthropic", "Anthropic", "claude-sonnet-4-0"),
  new StubProvider("gemini", "Gemini", "gemini-2.5-flash"),
  new StubProvider("groq", "Groq", "llama-3.3-70b-versatile"),
  new StubProvider("openrouter", "OpenRouter", "openai/gpt-4.1-mini"),
  new StubProvider("ollama", "Ollama", "llama3.2")
];
function getProviders() {
  return providers;
}
function getProvider(providerId) {
  const provider = providers.find((item) => item.id === providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider;
}

// src/utils/prompts.ts
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import chalk3 from "chalk";
function createPrompt() {
  return createInterface({ input, output });
}
async function promptInput(message) {
  const rl = createPrompt();
  try {
    return (await rl.question(`${chalk3.cyan(message)}
${chalk3.cyan("> ")}`)).trim();
  } finally {
    rl.close();
  }
}
async function promptPassword(message) {
  return promptInput(message);
}
async function promptSelect(message, choices, defaultIndex = 0) {
  const lines = choices.map((choice, index2) => {
    const marker = index2 === defaultIndex ? chalk3.cyan("\u25CF") : chalk3.gray("\u25CB");
    const number = chalk3.gray(`${index2 + 1}.`);
    return `${marker} ${number} ${choice}`;
  }).join("\n");
  const answer = await promptInput(`${message}
${lines}
Entrez un num\xE9ro`);
  if (!answer) {
    return choices[defaultIndex] ?? choices[0] ?? "";
  }
  const index = Number.parseInt(answer, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= choices.length) {
    throw new Error("S\xE9lection invalide.");
  }
  return choices[index];
}
async function promptSelectOrCustom(message, choices, defaultIndex = 0) {
  const customLabel = "Entrer un autre mod\xE8le";
  const value = await promptSelect(message, [...choices, customLabel], defaultIndex);
  if (value !== customLabel) {
    return value;
  }
  const customValue = await promptInput("Entrez l\u2019identifiant exact du mod\xE8le");
  if (!customValue) {
    throw new Error("Nom de mod\xE8le invalide.");
  }
  return customValue;
}
async function promptMultiline(message) {
  const rl = createPrompt();
  const lines = [];
  output.write(`${chalk3.cyanBright(`
${message} >`)}
`);
  output.write(`${chalk3.gray("Terminez votre message avec un simple '.' sur une ligne vide.")}
`);
  try {
    while (true) {
      const line = await rl.question(chalk3.cyan("... "));
      if (line.trim() === ".") {
        break;
      }
      lines.push(line);
    }
  } finally {
    rl.close();
  }
  return lines.join("\n").trim();
}

// src/commands/login.ts
async function loginCommand() {
  const current = getStoredConfig();
  if (!current.provider || !current.model) {
    throw new Error("Aucun fournisseur configur\xE9. Lancez `magic-cli` d\u2019abord.");
  }
  const provider = getProvider(current.provider);
  const apiKey = await promptPassword(`Entrez la cl\xE9 API pour ${provider.label}`);
  saveConfig({
    provider: current.provider,
    model: current.model,
    apiKey
  });
}

// src/commands/logout.ts
function logoutCommand() {
  clearConfig();
}

// src/commands/model.ts
async function modelCommand() {
  const current = getStoredConfig();
  if (!current.provider) {
    throw new Error("Aucun fournisseur configur\xE9. Lancez `magic-cli` d\u2019abord.");
  }
  const provider = getProvider(current.provider);
  const models = await provider.getModels();
  const defaultIndex = Math.max(models.indexOf(current.model ?? provider.getDefaultModel()), 0);
  const model = await promptSelectOrCustom("Choisissez un mod\xE8le", models, defaultIndex);
  saveConfig({
    provider: current.provider,
    model,
    apiKey: current.apiKey
  });
}

// src/commands/provider.ts
async function providerCommand() {
  const current = getStoredConfig();
  const providers2 = getProviders();
  const labels = providers2.map((item) => item.label);
  const defaultIndex = Math.max(
    providers2.findIndex((item) => item.id === current.provider),
    0
  );
  const providerLabel = await promptSelect("Choisissez un fournisseur", labels, defaultIndex);
  const selectedProvider = providers2.find((item) => item.label === providerLabel);
  if (!selectedProvider) {
    throw new Error("Fournisseur introuvable.");
  }
  const models = await selectedProvider.getModels();
  const model = await promptSelectOrCustom(
    "Choisissez un mod\xE8le",
    models,
    Math.max(models.indexOf(selectedProvider.getDefaultModel()), 0)
  );
  saveConfig({
    provider: selectedProvider.id,
    model,
    apiKey: selectedProvider.id === current.provider ? current.apiKey : void 0
  });
}

// src/commands/uninstall.ts
import chalk4 from "chalk";
function uninstallCommand() {
  clearConfig();
  process.stdout.write("Configuration et cache supprim\xE9s.\n");
  process.stdout.write(chalk4.gray("Ex\xE9cutez `npm uninstall -g magique-cli` pour retirer le package globalement.\n"));
}

// src/services/onboarding-service.ts
async function runOnboarding() {
  const providers2 = getProviders();
  const providerLabels = providers2.map((provider) => provider.label);
  const providerLabel = await promptSelect("Choisissez un fournisseur", providerLabels);
  const selectedProvider = providers2.find((item) => item.label === providerLabel);
  if (!selectedProvider) {
    throw new Error("Impossible de r\xE9soudre le fournisseur s\xE9lectionn\xE9.");
  }
  const models = await selectedProvider.getModels();
  const defaultModelIndex = Math.max(models.indexOf(selectedProvider.getDefaultModel()), 0);
  const model = await promptSelectOrCustom("Choisissez un mod\xE8le", models, defaultModelIndex);
  const apiKey = selectedProvider.id === "ollama" ? void 0 : await promptPassword("Entrez la cl\xE9 API");
  saveConfig({ provider: selectedProvider.id, model, apiKey });
}

// src/utils/response-format.ts
import chalk5 from "chalk";
var TERMINAL_SYSTEM_PROMPT = [
  "Tu r\xE9ponds dans un terminal.",
  "Par d\xE9faut, \xE9vite le Markdown d\xE9coratif.",
  "Si tu donnes du code, pr\xE9f\xE8re un bloc clair et compact.",
  "Fais des r\xE9ponses courtes, propres et lisibles dans un terminal.",
  "Tu peux utiliser des listes simples si cela aide la lecture."
].join(" ");
function buildTerminalMessages(messages) {
  return [
    {
      role: "system",
      content: TERMINAL_SYSTEM_PROMPT
    },
    ...messages
  ];
}
function createResponseFormatter() {
  let buffer = "";
  let insideCodeFence = false;
  let currentCodeLanguage = "";
  let currentCodeLines = [];
  const sanitizeLine = (line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (!insideCodeFence) {
        insideCodeFence = true;
        currentCodeLanguage = trimmed.slice(3).trim();
        currentCodeLines = [];
        return "";
      }
      insideCodeFence = false;
      const code = currentCodeLines.join("\n");
      const language = currentCodeLanguage;
      currentCodeLanguage = "";
      currentCodeLines = [];
      return renderCodeBlock(code, language);
    }
    if (insideCodeFence) {
      currentCodeLines.push(line);
      return "";
    }
    let output2 = line.replace(/^#{1,6}\s*/g, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1").replace(/\*(.*?)\*/g, "$1");
    output2 = output2.replace(/`([^`]+)`/g, (_, code) => chalk5.yellow(code));
    return output2;
  };
  const flushCompleteLines = () => {
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    return parts.map((line) => sanitizeLine(line)).filter((line, index, array) => !(line === "" && array[index - 1] === "")).join("\n");
  };
  return {
    push(chunk) {
      buffer += chunk;
      return flushCompleteLines();
    },
    finish() {
      let tail = sanitizeLine(buffer);
      if (insideCodeFence && currentCodeLines.length > 0) {
        tail += renderCodeBlock(currentCodeLines.join("\n"), currentCodeLanguage);
        insideCodeFence = false;
        currentCodeLanguage = "";
        currentCodeLines = [];
      }
      buffer = "";
      return tail;
    }
  };
}

// src/utils/terminal.ts
function clearTerminal() {
  process.stdout.write("\x1Bc");
}
function isPipedInput() {
  return !process.stdin.isTTY;
}
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

// src/utils/spinner.ts
var frames = ["|", "/", "-", "\\"];
function createSpinner(message) {
  if (!process.stdout.isTTY) {
    return {
      stop() {
        return;
      }
    };
  }
  let frameIndex = 0;
  process.stdout.write(`${frames[frameIndex]} ${message}`);
  const interval = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames.length;
    process.stdout.write(`\r${frames[frameIndex]} ${message}`);
  }, 80);
  return {
    stop() {
      clearInterval(interval);
      process.stdout.write("\r\x1B[K");
    }
  };
}

// src/services/chat-service.ts
async function runInteractiveChat(config) {
  const provider = getProvider(config.provider);
  const sessionMessages = [];
  while (true) {
    const input2 = await promptMultiline("vous");
    if (!input2) {
      continue;
    }
    if (input2 === "exit") {
      process.stdout.write("\n");
      break;
    }
    if (input2 === "clear") {
      clearTerminal();
      continue;
    }
    const userMessage = { role: "user", content: input2 };
    sessionMessages.push(userMessage);
    appendHistory(userMessage);
    const spinner = createSpinner("magique-cli r\xE9fl\xE9chit...");
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
      }
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
    const assistantMessage = { role: "assistant", content: fullText };
    sessionMessages.push(assistantMessage);
    appendHistory(assistantMessage);
    process.stdout.write("\n\n");
  }
}
async function askOnce(config, input2) {
  const provider = getProvider(config.provider);
  const spinner = createSpinner("magique-cli r\xE9fl\xE9chit...");
  const messages = buildTerminalMessages([{ role: "user", content: input2 }]);
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
  process.stdout.write("\n");
}

// src/index.ts
var program = new Command();
async function ensureConfigured() {
  if (hasConfig()) {
    return;
  }
  process.stdout.write(renderWelcome());
  await runOnboarding();
  process.stdout.write(chalk6.green("Configuration enregistr\xE9e avec succ\xE8s.\n"));
}
program.name("magic-cli").description("Une CLI IA moderne multi-fournisseurs").version("0.1.0");
program.command("login").description("D\xE9finir ou mettre \xE0 jour la cl\xE9 API").action(async () => {
  await loginCommand();
  process.stdout.write(chalk6.green("Cl\xE9 API enregistr\xE9e.\n"));
});
program.command("provider").description("Changer de fournisseur").action(async () => {
  await providerCommand();
  process.stdout.write(chalk6.green("Fournisseur mis \xE0 jour.\n"));
});
program.command("model").description("Changer de mod\xE8le").action(async () => {
  await modelCommand();
  process.stdout.write(chalk6.green("Mod\xE8le mis \xE0 jour.\n"));
});
program.command("config").description("Afficher la configuration actuelle").action(() => {
  configCommand();
});
program.command("logout").description("Effacer le fournisseur, le mod\xE8le, la cl\xE9 API et la session").action(() => {
  logoutCommand();
  process.stdout.write(chalk6.green("D\xE9connexion effectu\xE9e.\n"));
});
program.command("uninstall").description("Effacer les donn\xE9es locales et afficher la commande de d\xE9sinstallation").action(() => {
  uninstallCommand();
});
program.command("ask").description("Poser une seule question").argument("<prompt>", "Question \xE0 poser").action(async (prompt) => {
  await ensureConfigured();
  const config = getStoredConfig();
  if (!config.provider || !config.model) {
    throw new Error("Configuration incompl\xE8te.");
  }
  await askOnce(
    {
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey
    },
    prompt
  );
});
program.action(async () => {
  await ensureConfigured();
  const config = getStoredConfig();
  if (!config.provider || !config.model) {
    throw new Error("Configuration incompl\xE8te.");
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
        apiKey: config.apiKey
      },
      piped
    );
    return;
  }
  process.stdout.write(renderWelcome());
  await runInteractiveChat({
    provider: config.provider,
    model: config.model,
    apiKey: config.apiKey
  });
});
program.parseAsync(process.argv).catch((error) => {
  const message = error instanceof Error ? error.message : "Erreur inconnue";
  process.stderr.write(chalk6.red(`Erreur : ${message}
`));
  process.exitCode = 1;
});
//# sourceMappingURL=index.js.map