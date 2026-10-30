export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  srcDir: ".",            // app.vue neben der Konfiguration (gleich in Nuxt 3 und 4)
  modules: ["@hostily/captcha-vue/nuxt"],
  hostilyCaptcha: { sprache: "de" },   // Vorgaben fuer alle <HostilyCaptcha>
  devtools: { enabled: false },
  telemetry: false,
});
