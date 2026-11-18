/* Each visible cursor owns exactly one operation until it is finished. */
export function scheduleJobs(prepared, existing, start, cursorCount, gap = 24) {
  const available = Array(cursorCount).fill(start);
  for (const job of existing) {
    if (job.done || !Number.isFinite(job.start) || job.slot < 0 || job.slot >= cursorCount) continue;
    available[job.slot] = Math.max(available[job.slot], job.start + job.duration + gap);
  }
  for (const job of prepared) {
    let slot = 0;
    for (let index = 1; index < cursorCount; index++) if (available[index] < available[slot]) slot = index;
    job.slot = slot;
    job.start = available[slot];
    available[slot] = job.start + job.duration + gap;
  }
  return available;
}
