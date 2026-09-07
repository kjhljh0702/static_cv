export class SoundManager {
  enabled = false;
  context: AudioContext | null = null;
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.play("click");
    return this.enabled;
  }
  play(kind: "click" | "open" | "close" | "page" | "advance" = "click") {
    if (!this.enabled) return;
    try {
      this.context ??= new AudioContext();
      const ctx = this.context;
      void ctx.resume().catch(() => {});
      const notes =
        kind === "advance"
          ? [523, 659, 784]
          : kind === "open"
            ? [120, 180]
            : kind === "close"
              ? [160, 95]
              : kind === "page"
                ? [420]
                : [600];
      notes.forEach((hz, i) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain(),
          start = ctx.currentTime + i * 0.075;
        o.type = kind === "advance" ? "triangle" : "square";
        o.frequency.setValueAtTime(hz, start);
        o.frequency.exponentialRampToValueAtTime(hz * 0.65, start + 0.055);
        g.gain.setValueAtTime(0.025, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.075);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(start);
        o.stop(start + 0.08);
      });
    } catch {
      this.enabled = false;
    }
  }
}
