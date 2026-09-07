import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'minecraft/public/minecraft/sounds/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const { file } of JSON.parse(readFileSync(root + 'source-manifest.json', 'utf8'))) {
    const decoded = await page.evaluate(async bytes => {
      const context = new OfflineAudioContext(2, 1, 44100);
      const audio = await context.decodeAudioData(new Uint8Array(bytes).buffer);
      return { rate: audio.sampleRate, channels: Array.from({ length: audio.numberOfChannels }, (_, i) => Array.from(audio.getChannelData(i))) };
    }, Array.from(readFileSync(root + file)));
    const channels = decoded.channels.length, frames = decoded.channels[0].length;
    const wav = Buffer.alloc(44 + frames * channels * 2);
    wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(channels, 22);
    wav.writeUInt32LE(decoded.rate, 24); wav.writeUInt32LE(decoded.rate * channels * 2, 28);
    wav.writeUInt16LE(channels * 2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
    for (let i = 0; i < frames; i++) for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, decoded.channels[c][i]));
      wav.writeInt16LE(Math.round(sample * (sample < 0 ? 32768 : 32767)), 44 + (i * channels + c) * 2);
    }
    writeFileSync(root + file.replace('.ogg', '.wav'), wav);
  }
} finally { await browser.close(); }
