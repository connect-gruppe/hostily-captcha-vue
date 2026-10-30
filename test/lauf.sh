#!/bin/bash
# Prueft @hostily/captcha-vue: Paket bauen (node:22), als Tarball ins Nuxt-Beispiel installieren (Nuxt 3 oder 4), bauen und starten,
# SSR-HTML pruefen, Browsertest gegen das echte Pruefprojekt 19. Zusaetzlich reines Vue 3.3 (aeltestes unterstuetztes) mit Server-Rendering.
#   flock /tmp/claude-0/ap-docker.lock integrationen/komponenten/vue/test/lauf.sh [3|4]
set -e
. "$(dirname "$0")/../../test/container.sh"
KP_PAKET=vue
V="${1:-4}"
case "$V" in
  3) NUXT="nuxt@3" ;;
  4) NUXT="nuxt@4" ;;
  *) echo "Variante 3 oder 4"; exit 1 ;;
esac
kp_pruefen
trap kp_ende EXIT INT TERM
kp_kopieren vue vue-$V
cp "$KOMP/vue/test/ssr.mjs" "$ARBEIT/vue-$V/ssr.mjs"
kp_start vue-$V
echo "=== Paket bauen ==="
kp_ex "cd /arbeit/vue-$V && npm install --no-package-lock 2>&1 | tail -1 && npm run build && npm pack --pack-destination /arbeit/vue-$V/beispiel | tail -1"
echo "=== Reines Vue 3.3, Server-Rendering ==="
kp_ex "mkdir -p /arbeit/vue-$V/ssr && cd /arbeit/vue-$V/ssr && cp ../ssr.mjs . && echo '{\"type\":\"module\"}' > package.json && npm install --no-package-lock vue@3.3.0 ../beispiel/hostily-captcha-vue-0.1.0.tgz 2>&1 | tail -1 && node ssr.mjs"
echo "=== Beispiel: Nuxt ($NUXT) ==="
kp_ex "cd /arbeit/vue-$V/beispiel && npm install --no-package-lock --save=false $NUXT ./hostily-captcha-vue-0.1.0.tgz 2>&1 | tail -2 && npx nuxt build 2>&1 | tail -6"
kp_ex "cd /arbeit/vue-$V/beispiel && node -p \"'Nuxt ' + require('nuxt/package.json').version + ', Vue ' + require('vue/package.json').version\""
docker exec -d -w /arbeit/vue-$V/beispiel -e PORT=$PORT -e HOST=0.0.0.0 $C node .output/server/index.mjs
for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:$PORT/ && break; sleep 1; done
echo "=== Serverseitig gerendertes HTML ==="
HTML=$(curl -s http://localhost:$PORT/)
echo "$HTML" | grep -o '<hostily-captcha[^>]*>' | head -1
echo "$HTML" | grep -q '<hostily-captcha[^>]*data-site-key="8cdc48a989b7c79151d6"' && echo "OK     SSR: Element mit data-site-key im Server-HTML" || { echo "FEHLER SSR"; exit 1; }
echo "=== Browser (Playwright) ==="
kp_browser vue-$V "nuxt-$V"
