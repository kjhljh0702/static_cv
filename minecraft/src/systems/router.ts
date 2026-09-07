import { BASE } from "../data";
export class Router {
  onChange: () => void = () => {};
  constructor() {
    addEventListener("popstate", () => this.onChange());
  }
  get path() {
    let p = location.pathname;
    try {
      p = decodeURI(p);
    } catch {
      return "/not-found";
    }
    if (p.startsWith(BASE)) p = p.slice(BASE.length - 1);
    if (p === "/" || p === "/index.html") p = "/inventory";
    return p.replace(/\/$/, "");
  }
  go(route: string, replace = false) {
    const href = BASE + route.replace(/^\//, "");
    if (replace) history.replaceState({ cv: true }, "", href);
    else if (location.pathname + location.search !== href)
      history.pushState({ cv: true }, "", href);
    this.onChange();
  }
  back() {
    if (history.state?.cv) history.back();
    else this.go("/inventory", true);
  }
}
