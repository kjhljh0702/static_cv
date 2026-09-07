import { el, button, image } from "./dom";
import { BASE, ui } from "../data";
export type BookRecord = {
  title: string;
  text: string;
  image?: string;
  imageLabel?: string;
  links?: { label: string; href: string }[];
};
export function paginate(text: string, width = 136, maxLines = 12): string[] {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d")!;
  ctx.font = "8px InventoryPixel";
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width <= width) {
        line = test;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const char of [...word]) {
        if (ctx.measureText(line + char).width > width) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    if (line) lines.push(line);
  }
  const pages: string[] = [];
  for (let i = 0; i < lines.length; i += maxLines)
    pages.push(lines.slice(i, i + maxLines).join("\n"));
  return pages.length ? pages : [""];
}
export function book(
  record: BookRecord,
  page: number,
  turn: (page: number) => void,
  close: () => void,
) {
  const pages = paginate(record.title + "\n\n" + record.text);
  const total = pages.length + (record.image ? 1 : 0);
  const current = Math.max(0, Math.min(total - 1, page));
  const shell = el("section", "book-window");
  shell.setAttribute("aria-label", record.title);
  shell.append(el("h2", "sr-only", record.title));
  const paper = el("div", "book-paper");
  paper.append(
    el(
      "div",
      "page-count",
      ui(`Page ${current + 1} of ${total}`, `${current + 1} / ${total} 쪽`),
    ),
  );
  if (current === pages.length && record.image) {
    paper.append(
      image(
        BASE + record.image,
        record.imageLabel ?? record.title,
        "book-figure",
      ),
    );
    const view = el(
      "a",
      "book-image-link",
      ui("Open full-size image", "원본 이미지 보기"),
    );
    view.href = BASE + record.image;
    view.target = "_blank";
    view.rel = "noopener";
    paper.append(view);
  } else paper.append(el("p", "book-text", pages[current]));
  shell.append(paper);
  const controls = el("div", "book-controls");
  const prev = button("◀", () => turn(current - 1), "page-arrow");
  prev.setAttribute("aria-label", ui("Previous page", "이전 쪽"));
  prev.disabled = current === 0;
  const next = button("▶", () => turn(current + 1), "page-arrow");
  next.setAttribute("aria-label", ui("Next page", "다음 쪽"));
  next.disabled = current === total - 1;
  controls.append(prev, button(ui("Done", "완료"), close), next);
  shell.append(controls);
  return shell;
}
