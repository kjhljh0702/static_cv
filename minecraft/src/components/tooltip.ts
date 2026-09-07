import { el } from "./dom";
import { ui, type Item } from "../data";
export class TooltipManager {
  node = document.querySelector<HTMLDivElement>("#tooltip")!;
  show(item: Item, x: number, y: number) {
    this.node.replaceChildren();
    this.node.append(
      el("div", `item-name ${item.rarity ?? "white"}`, item.name),
      el("div", "tooltip-category", item.category),
    );
    item.lines?.forEach((line) =>
      this.node.append(el("div", "tooltip-detail", line)),
    );
    this.node.append(
      el(
        "div",
        "tooltip-hint",
        item.download
          ? ui("Download PDF", "PDF 다운로드")
          : item.href
            ? ui("Open link", "링크 열기")
            : ui("Click to inspect", "클릭하여 확인"),
      ),
    );
    this.node.hidden = false;
    this.move(x, y);
  }
  move(x: number, y: number) {
    if (this.node.hidden) return;
    const { width, height } = this.node.getBoundingClientRect();
    let left = x + 14,
      top = y - 28;
    if (left + width > innerWidth - 8) left = x - width - 14;
    if (top + height > innerHeight - 8) top = innerHeight - height - 8;
    this.node.style.left = `${Math.max(8, left)}px`;
    this.node.style.top = `${Math.max(8, top)}px`;
  }
  hide() {
    this.node.hidden = true;
  }
}
