# @hostily/captcha-vue

**Deutsch**

Vue-3-Komponente und Nuxt-3/4-Modul für [hostily Captcha](https://captcha.hostily.de): eine dünne Hülle um das Web Component
`<hostily-captcha>`. Vue ab 3.3, SSR-sicher, TypeScript-Typen inklusive. Die Komponente liefert nur das **Token**; das Secret gehört
nie in den Browser – das Token prüft Ihr Server (z. B. mit `@hostily/captcha`).

```sh
npm install @hostily/captcha-vue
```

**Vue 3**

```vue
<script setup>
import { ref } from "vue";
import { HostilyCaptcha } from "@hostily/captcha-vue";
const captcha = ref(null);
const token = ref("");
</script>

<template>
  <form method="post" action="/kontakt">
    <HostilyCaptcha ref="captcha" site-key="IHR_SITE_KEY" @verify="(t) => (token = t)" @expire="token = ''" />
    <button>Senden</button>
  </form>
</template>
```

**Nuxt 3 und 4**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@hostily/captcha-vue/nuxt"],
  hostilyCaptcha: { sprache: "de" },   // optionale Vorgaben für alle Komponenten (nur Öffentliches, nie das Secret)
});
```

`<HostilyCaptcha>` steht dann ohne Import in allen Seiten zur Verfügung. Das Modul benötigt `@nuxt/kit` (kommt mit Nuxt).

Im Formular steht das Token im Feld `hostily-captcha-token`; `@verify` bekommt es zusätzlich.

| Prop | Bedeutung | Vorgabe |
|---|---|---|
| `site-key` | Site-Key des Projekts (Pflicht) | – |
| `api` | Basisadresse des Dienstes | `https://captcha.hostily.de/api/` |
| `modus` | `sichtbar` / `unsichtbar` | `sichtbar` |
| `sprache` | `de` / `en` | aus `<html lang>` |
| `theme` | `hell` / `dunkel` | System |
| `feld` | Name des Token-Feldes | `hostily-captcha-token` |
| `recaptcha-kompatibel` | zusätzlich `g-recaptcha-response` | aus |
| `widget-url` | Adresse des Widget-Skripts (selbst gehostet) | `<api>/../widget/hostily-captcha.js` |

Ereignisse: `@verify(token)`, `@error(meldung, code)` (`code`: `netz`, `gesperrt`, `abgelehnt`, `challenge`, `rechnen`, `verfahren`,
`skript`), `@expire` (Token abgelaufen oder vom Widget zurückgesetzt; nicht nach eigenem `reset()`).
Per Template-Ref: `reset()` (nach Absenden per Ajax; ein Token gilt nur einmal), `loesen()` (Promise mit dem Token), `token()`.
Das Widget-Skript wird einmal je Seite geladen, erst im Browser. CSP: `script-src` und `connect-src` für captcha.hostily.de,
`worker-src blob:`, `script-src 'wasm-unsafe-eval'`.

Geprüft (Produktionsbuild, Browsertest gegen den echten Dienst): Nuxt 3.21 und Nuxt 4.6 (Vue 3.5); Server-Rendering mit reinem Vue 3.3.0.
Beispielprojekt: `beispiel/`, Test: `test/lauf.sh`.

**English**

Vue 3 component and Nuxt 3/4 module for [hostily Captcha](https://captcha.hostily.de): a thin wrapper around the `<hostily-captcha>`
web component. Vue 3.3+, SSR-safe, types included. It only delivers the **token**; verify it on your server with the secret.

Install and use as above. Nuxt: add `"@hostily/captcha-vue/nuxt"` to `modules`; `<HostilyCaptcha>` is auto-imported; optional public
defaults under `hostilyCaptcha` in the config. Props: `site-key` (required), `api`, `modus` (`sichtbar`/`unsichtbar` = visible/invisible),
`sprache` (`de`/`en`), `theme` (`hell`/`dunkel` = light/dark), `feld`, `recaptcha-kompatibel`, `widget-url`. Events: `verify(token)`,
`error(message, code)`, `expire` (not fired by your own `reset()`). Template-ref methods: `reset()`, `loesen()`, `token()`.
Tested: Nuxt 3.21 and 4.6 production builds with a browser test against the live service; server rendering with plain Vue 3.3.0.

MIT
