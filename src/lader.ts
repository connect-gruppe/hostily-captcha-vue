// Laedt das Widget-Skript genau einmal je Adresse (auch bei vielen Komponenten auf einer Seite) und nur im Browser.
const geladen = new Map<string, Promise<void>>();

export const STANDARD_API = "https://captcha.hostily.de/api/";

/** Skriptadresse des Widgets aus der API-Adresse: https://dienst/api/ -> https://dienst/widget/hostily-captcha.js */
export function widgetAdresse(api?: string, widgetUrl?: string): string {
  if (widgetUrl) return widgetUrl;
  try {
    return new URL("../widget/hostily-captcha.js", new URL(api || STANDARD_API, document.baseURI)).href;
  } catch {
    return "https://captcha.hostily.de/widget/hostily-captcha.js";
  }
}

export function ladeWidget(src: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve(); // Serverseitig nichts tun
  if (customElements.get("hostily-captcha")) return Promise.resolve();
  let p = geladen.get(src);
  if (!p) {
    p = new Promise<void>((ok, nein) => {
      const vorhanden = document.querySelector<HTMLScriptElement>(`script[data-hostily-captcha][src="${src}"]`);
      const s = vorhanden || document.createElement("script");
      s.addEventListener("load", () => ok());
      s.addEventListener("error", () => { geladen.delete(src); nein(new Error("Widget-Skript nicht geladen: " + src)); });
      if (!vorhanden) {
        s.src = src;
        s.async = true;
        s.setAttribute("data-hostily-captcha", "");
        document.head.appendChild(s);
      }
    });
    geladen.set(src, p);
  }
  return p;
}
