const frames = ['|', '/', '-', '\\'];

export function createSpinner(message: string) {
  if (!process.stdout.isTTY) {
    return {
      stop() {
        return;
      },
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
      process.stdout.write('\r\x1b[K');
    },
  };
}
