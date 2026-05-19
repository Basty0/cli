export function clearTerminal(): void {
  process.stdout.write('\x1Bc');
}

export function isPipedInput(): boolean {
  return !process.stdin.isTTY;
}

export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}
