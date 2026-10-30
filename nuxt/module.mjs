// Nuxt-Modul: registriert <HostilyCaptcha> (automatisch importiert) und gibt Vorgaben aus nuxt.config weiter.
//   export default defineNuxtConfig({ modules: ["@hostily/captcha-vue/nuxt"], hostilyCaptcha: { sprache: "de" } })
import { addComponent, addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "@hostily/captcha-vue", configKey: "hostilyCaptcha", compatibility: { nuxt: ">=3.0.0" } },
  defaults: {},
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    // Nur oeffentliche Vorgaben: Site-Key, Modus, Sprache. Das Secret gehoert nie hierher.
    nuxt.options.runtimeConfig.public.hostilyCaptcha = { ...options, ...(nuxt.options.runtimeConfig.public.hostilyCaptcha || {}) };
    nuxt.options.build.transpile.push("@hostily/captcha-vue");
    addComponent({ name: "HostilyCaptcha", export: "HostilyCaptcha", filePath: "@hostily/captcha-vue" });
    addPlugin(resolve("./runtime/plugin.mjs"));
  },
});
