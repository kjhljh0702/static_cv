type SoundKind = "click" | "open" | "close" | "page" | "book-close" | "advance";
const levels: Record<SoundKind, number> = {
  click: 0.35, open: 0.3, close: 0.3, page: 0.65, "book-close": 0.45, advance: 0.2,
};

/** Original Minecraft recordings. Audio is unlocked only by the sound toggle. */
export class SoundManager {
  enabled = false;
  context: AudioContext | null = null;
  private buffers = new Map<SoundKind, Promise<AudioBuffer>>();
  private sources = new Set<AudioBufferSourceNode>();
  private generation = 0;

  toggle() {
    this.enabled = !this.enabled;
    this.generation++;
    if (this.enabled) this.play("click");
    else {
      for (const source of this.sources) source.stop();
      this.sources.clear();
    }
    return this.enabled;
  }

  play(kind: SoundKind = "click") {
    if (!this.enabled) return;
    try {
      this.context ??= new AudioContext();
      const ctx = this.context;
      const generation = this.generation;
      const requested = performance.now();
      const resumed = ctx.resume();
      let buffer = this.buffers.get(kind);
      if (!buffer) {
        buffer = fetch(`${import.meta.env.BASE_URL}minecraft/sounds/${kind}.wav`)
          .then(response => {
            if (!response.ok) throw new Error("Sound unavailable");
            return response.arrayBuffer();
          })
          .then(bytes => ctx.decodeAudioData(bytes));
        this.buffers.set(kind, buffer);
      }
      void Promise.all([resumed, buffer]).then(([, decoded]) => {
        // Never replay a queued interaction after mute, or after a slow download.
        if (!this.enabled || generation !== this.generation || performance.now() - requested > 1500) return;
        if (this.sources.size >= 6) this.sources.values().next().value?.stop();
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = decoded;
        gain.gain.value = levels[kind];
        source.connect(gain);
        gain.connect(ctx.destination);
        this.sources.add(source);
        source.onended = () => {
          this.sources.delete(source);
          source.disconnect();
          gain.disconnect();
        };
        source.start();
      }).catch(() => {
        this.buffers.delete(kind);
      });
    } catch {
      this.enabled = false;
    }
  }
}
