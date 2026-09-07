import { BASE, ui, type Item } from "../data";
import { el, image } from "./dom";
import type { TooltipManager } from "./tooltip";
export function sprite(item: Pick<Item, "sprite" | "enchanted">) {
  const wrap = el("span", `item-sprite${item.enchanted ? " enchanted" : ""}`);
  wrap.append(
    image(BASE + `minecraft/items/${item.sprite}.png`, "", "pixel-image"),
  );
  return wrap;
}
export function slot(
  item: Item | undefined,
  tooltip: TooltipManager,
  activate: (i: Item) => void,
  index = 0,
) {
  const s = el("button", "slot");
  s.type = "button";
  s.dataset.slot = String(index);
  s.setAttribute(
    "aria-label",
    item
      ? `${item.name}. ${item.category}${item.count ? `. ${item.count} entries` : ""}`
      : ui("Empty slot", "빈 슬롯"),
  );
  if (!item) {
    s.classList.add("empty");
    s.tabIndex = -1;
    return s;
  }
  s.dataset.item = item.id;
  s.setAttribute("aria-describedby", "tooltip");
  s.append(sprite(item));
  if (item.count && item.count > 1)
    s.append(el("span", "stack-count", String(item.count)));
  s.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "touch") tooltip.show(item, e.clientX, e.clientY);
  });
  s.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "touch") tooltip.move(e.clientX, e.clientY);
  });
  s.addEventListener("pointerleave", () => tooltip.hide());
  s.addEventListener("focus", () => {
    const r = s.getBoundingClientRect();
    tooltip.show(item, r.right, r.top);
  });
  s.addEventListener("blur", () => tooltip.hide());
  s.addEventListener("click", () => {
    tooltip.hide();
    activate(item);
  });
  return s;
}
export function grid(
  items: (Item | undefined)[],
  count: number,
  tooltip: TooltipManager,
  activate: (i: Item) => void,
  columns = 9,
) {
  const g = el("div", "slot-grid");
  g.style.setProperty("--columns", String(columns));
  g.setAttribute("role", "group");
  g.setAttribute("aria-label", ui("Inventory slots", "인벤토리 슬롯"));
  for (let i = 0; i < count; i++)
    g.append(slot(items[i], tooltip, activate, i));
  g.addEventListener("keydown", (e) => {
    if (
      ![
        "ArrowRight",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    )
      return;
    const current = (e.target as HTMLElement).closest<HTMLButtonElement>(
      ".slot",
    );
    if (!current) return;
    e.preventDefault();
    const slots = [...g.querySelectorAll<HTMLButtonElement>(".slot")];
    const at = slots.indexOf(current),
      step =
        e.key === "ArrowRight"
          ? 1
          : e.key === "ArrowLeft"
            ? -1
            : e.key === "ArrowDown"
              ? columns
              : -columns;
    let next = e.key === "Home" ? 0 : e.key === "End" ? count - 1 : at + step;
    next = Math.max(0, Math.min(count - 1, next));
    slots[next].focus();
  });
  return g;
}
