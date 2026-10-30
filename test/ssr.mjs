// Reines Vue 3 (ohne Nuxt): Server-Rendering ohne Browser darf nicht abstuerzen und liefert das Element mit den Attributen.
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { HostilyCaptcha } from "@hostily/captcha-vue";

const app = createSSRApp({ render: () => h(HostilyCaptcha, { siteKey: "ABC", modus: "unsichtbar", sprache: "en", recaptchaKompatibel: true }) });
const html = await renderToString(app);
console.log(html);
const ok = /<hostily-captcha[^>]*data-site-key="ABC"/.test(html) && /data-modus="unsichtbar"/.test(html) && /data-sprache="en"/.test(html) && /data-recaptcha-kompatibel/.test(html);
console.log(ok ? "OK     Vue " + (await import("vue")).version + ": SSR liefert Element mit Attributen" : "FEHLER SSR");
process.exit(ok ? 0 : 1);
