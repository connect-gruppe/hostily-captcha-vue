import type { HostilyCaptchaVorgaben } from "../dist/index.js";
declare const modul: import("@nuxt/schema").NuxtModule<HostilyCaptchaVorgaben>;
export default modul;
declare module "@nuxt/schema" {
  interface NuxtConfig { hostilyCaptcha?: HostilyCaptchaVorgaben }
  interface NuxtOptions { hostilyCaptcha?: HostilyCaptchaVorgaben }
}
