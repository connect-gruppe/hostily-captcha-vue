import { defineComponent, h, inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import { ladeWidget, widgetAdresse } from "./lader.js";

/** Schluessel, unter dem das Nuxt-Modul die Vorgaben (api, modus, sprache, ...) bereitstellt. */
export const VORGABEN = "hostily-captcha-vorgaben";

export interface HostilyCaptchaVorgaben {
  api?: string;
  modus?: "sichtbar" | "unsichtbar";
  sprache?: "de" | "en";
  theme?: "hell" | "dunkel";
  feld?: string;
  recaptchaKompatibel?: boolean;
  widgetUrl?: string;
}

type Element_ = HTMLElement & { reset(h?: string): void; loesen(): Promise<string>; token: string };

export const HostilyCaptcha = defineComponent({
  name: "HostilyCaptcha",
  props: {
    /** Site-Key des Projekts (oeffentlich). */
    siteKey: { type: String, required: true },
    /** Basisadresse des Dienstes, Vorgabe https://captcha.hostily.de/api/ */
    api: String,
    /** "sichtbar" (Vorgabe) oder "unsichtbar" */
    modus: String as PropType<"sichtbar" | "unsichtbar">,
    /** "de" oder "en"; ohne Angabe aus <html lang> */
    sprache: String as PropType<"de" | "en">,
    /** "hell" oder "dunkel" erzwingen */
    theme: String as PropType<"hell" | "dunkel">,
    /** Name des Token-Feldes, Vorgabe hostily-captcha-token */
    feld: String,
    /** Zusaetzlich g-recaptcha-response setzen */
    recaptchaKompatibel: { type: Boolean, default: undefined },
    /** Adresse des Widget-Skripts, wenn es nicht beim Dienst liegt */
    widgetUrl: String,
  },
  emits: {
    /** Token liegt vor. */
    verify: (_token: string) => true,
    /** Fehler; code: netz, gesperrt, abgelehnt, challenge, rechnen, verfahren oder skript. */
    error: (_meldung: string, _code: string) => true,
    /** Token abgelaufen oder zurueckgesetzt, ohne dass reset() gerufen wurde. */
    expire: () => true,
  },
  setup(props, { emit, expose }) {
    const vorgaben = inject<HostilyCaptchaVorgaben>(VORGABEN, {});
    const el = ref<Element_ | null>(null);
    let eigenesReset = false;
    let hatteToken = false;

    const geloest = (ev: Event) => { hatteToken = true; emit("verify", (ev as CustomEvent).detail.token); };
    const fehler = (ev: Event) => { const d = (ev as CustomEvent).detail || {}; emit("error", d.meldung || "", d.code || ""); };
    const zurueck = () => { if (!eigenesReset && hatteToken) { hatteToken = false; emit("expire"); } };

    const wert = <K extends keyof HostilyCaptchaVorgaben>(k: K) => (props as Record<string, unknown>)[k] ?? vorgaben[k];
    const src = () => widgetAdresse(wert("api") as string | undefined, wert("widgetUrl") as string | undefined);

    // Nur im Browser: onMounted laeuft nicht beim Rendern auf dem Server
    onMounted(() => {
      const e = el.value;
      if (!e) return;
      e.addEventListener("geloest", geloest);
      e.addEventListener("fehler", fehler);
      e.addEventListener("zurueckgesetzt", zurueck);
      ladeWidget(src()).catch((err: Error) => emit("error", err.message, "skript"));
    });
    onBeforeUnmount(() => {
      const e = el.value;
      if (!e) return;
      e.removeEventListener("geloest", geloest);
      e.removeEventListener("fehler", fehler);
      e.removeEventListener("zurueckgesetzt", zurueck);
    });
    watch(() => src(), (s) => { ladeWidget(s).catch(() => {}); });

    expose({
      /** Setzt das Widget zurueck (nach dem Absenden per Ajax). */
      reset() { eigenesReset = true; try { el.value?.reset(); } finally { eigenesReset = false; hatteToken = false; } },
      /** Loest (falls noetig) und liefert das Token. */
      loesen(): Promise<string> { return el.value ? el.value.loesen() : Promise.reject(new Error("Widget noch nicht bereit")); },
      /** Aktuelles Token oder "". */
      token: () => el.value?.token || "",
    });

    return () => {
      const a: Record<string, unknown> = { ref: el, "data-site-key": props.siteKey };
      const api = wert("api"), modus = wert("modus"), sprache = wert("sprache"), theme = wert("theme"), feld = wert("feld");
      if (api) a["data-api"] = api;
      if (modus) a["data-modus"] = modus;
      if (sprache) a["data-sprache"] = sprache;
      if (theme) a["data-theme"] = theme;
      if (feld) a["data-feld"] = feld;
      if (wert("recaptchaKompatibel")) a["data-recaptcha-kompatibel"] = "";
      return h("hostily-captcha", a);
    };
  },
});

export default HostilyCaptcha;
