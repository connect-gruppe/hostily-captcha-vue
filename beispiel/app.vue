<script setup lang="ts">
import { ref } from "vue";

// Pruefprojekt 19 des Dienstes: der Site-Key ist oeffentlich
const SITE_KEY = "8cdc48a989b7c79151d6";
const captcha = ref<{ reset(): void } | null>(null);
const token = ref("");
const abgelaufen = ref(0);
const fehler = ref("");
const gesendet = ref("");

function senden(e: Event) {
  // Hier ginge der Formularinhalt an den eigenen Server, der das Token mit dem Secret beim Dienst prueft
  gesendet.value = String(new FormData(e.target as HTMLFormElement).get("hostily-captcha-token") || "");
}
function zuruecksetzen() { captcha.value?.reset(); token.value = ""; }
</script>

<template>
  <main style="font-family: system-ui, sans-serif; margin: 2rem">
    <h1>hostily Captcha mit Nuxt</h1>
    <form @submit.prevent="senden">
      <p><input name="nachricht" placeholder="Nachricht"></p>
      <HostilyCaptcha
        ref="captcha"
        :site-key="SITE_KEY"
        @verify="(t: string) => { token = t; fehler = ''; }"
        @error="(_m: string, code: string) => (fehler = code)"
        @expire="() => { token = ''; abgelaufen++; }"
      />
      <p>
        <button type="button" id="reset-btn" @click="zuruecksetzen">Zurücksetzen</button>
        <button type="submit">Senden</button>
      </p>
    </form>
    <p>Token: <code id="token">{{ token }}</code></p>
    <p>Abgelaufen: <span id="abgelaufen">{{ abgelaufen }}</span> · Fehler: <span id="fehler">{{ fehler }}</span></p>
    <p>Gesendet: <code id="gesendet">{{ gesendet }}</code></p>
  </main>
</template>
