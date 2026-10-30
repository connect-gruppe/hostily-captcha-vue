import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.provide("hostily-captcha-vorgaben", useRuntimeConfig().public.hostilyCaptcha || {});
});
