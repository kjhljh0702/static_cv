export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}
export function button(
  text: string,
  action: () => void,
  className = "pixel-button",
) {
  const b = el("button", className, text);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}
export function image(src: string, alt: string, className = "") {
  const img = el("img", className);
  img.src = src;
  img.alt = alt;
  img.draggable = false;
  img.addEventListener(
    "error",
    () => {
      img.hidden = true;
      const fallback = el("span", "image-fallback", alt || "Item");
      img.after(fallback);
    },
    { once: true },
  );
  return img;
}
export function safeLink(href: string) {
  const u = new URL(href, location.href);
  return ["https:", "http:", "mailto:", "tel:"].includes(u.protocol)
    ? u.href
    : "#";
}
