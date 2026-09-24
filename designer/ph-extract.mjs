import fs from 'node:fs';
const base = 'node_modules/@phosphor-icons/core/assets';
const names = `magnifying-glass list shopping-cart-simple user user-circle house squares-four file-text chat-circle-dots heart shield-check caret-right caret-left caret-down caret-up globe-simple truck clock star funnel-simple check check-circle x plus minus bell play microphone camera factory lock-simple arrow-right arrow-left sparkle lightning seal-check certificate package storefront buildings handshake scales chart-line-up currency-circle-dollar calculator map-pin calendar-blank upload-simple download-simple trash pencil-simple eye eye-slash info warning warning-circle question headset envelope-simple phone key fingerprint qr-code command sliders-horizontal sort-ascending grid-four rows bookmark-simple share-network copy dots-three sign-out gear receipt credit-card bank wallet clipboard-text chart-bar trend-up t-shirt leaf bowl-food bricks cube lightbulb couch flask car drop translate moon sun paper-plane-right paperclip image video-camera robot target medal users-three arrows-left-right tag percent gift airplane-tilt boat warehouse barcode stack chart-pie handbag coffee tree wrench list-checks path timer circle-notch hand-waving arrow-square-out file-csv map-trifold chats-circle identification-card student newspaper`.split(/\s+/);
const out = { regular: {}, duotone: {} }, missing = [];
for (const w of ['regular', 'duotone']) for (const n of names) {
  const f = `${base}/${w}/${n}${w === 'regular' ? '' : '-duotone'}.svg`;
  if (!fs.existsSync(f)) { missing.push(w + ':' + n); continue; }
  const s = fs.readFileSync(f, 'utf8');
  out[w][n] = [...s.matchAll(/<path([^>]*)\/?>/g)].map((m) => [/\sd="([^"]+)"/.exec(m[1])[1], +(/opacity="([\d.]+)"/.exec(m[1])?.[1] ?? 1)]);
}
fs.writeFileSync('js/icons.js', '// Phosphor Icons 2.1.1 (MIT) path data — drawn as native Penpot paths via MCP\nconst PH = ' + JSON.stringify(out) + ';\n');
console.log('icons', Object.keys(out.regular).length, 'bytes', fs.statSync('js/icons.js').size, 'missing', missing.join(' '));
