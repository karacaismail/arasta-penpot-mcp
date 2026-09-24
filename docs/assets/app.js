// Arasta client interactions (no dependencies)
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  try { const t = localStorage.getItem('arasta-theme'); if (t) root.dataset.theme = t; } catch (e) {}
  // stepper
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-stepper] button'); if (!b) return;
    const inp = b.parentElement.querySelector('input'); const v = parseInt(inp.value.replace(/\D/g, '')) || 0; const step = v >= 1000 ? 500 : 10;
    const n = Math.max(0, v + (b === b.parentElement.firstElementChild ? -step : step)); inp.value = n.toLocaleString('tr-TR');
  });
  // dialogs + mega menu
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]'); if (!o) return;
    const id = o.dataset.open;
    if (id === 'mega') { const m = $('#mega'); const open = m.hidden; m.hidden = !open; o.setAttribute('aria-expanded', String(open)); return; }
    const d = document.getElementById(id); if (d && d.showModal) { d.showModal(); d.querySelector('input,button,a')?.focus(); }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#cmdk')?.showModal(); $('#cmdq')?.select(); }
    if (e.key === 'Escape') { const m = $('#mega'); if (m && !m.hidden) { m.hidden = true; $('[data-open=mega]')?.focus(); } }
  });
  // chips toggle
  document.addEventListener('click', (e) => { const c = e.target.closest('.chip:not(.chip-ai)'); if (c && !c.closest('form[data-aisearch]')) { const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on); c.classList.toggle('is-on', on); } });
  // AI search → results (keeps the current screen folder)
  document.addEventListener('submit', (e) => { const f = e.target.closest('[data-aisearch]'); if (!f) return; e.preventDefault(); location.href = 'arama.html'; });
  $$('.chip-ai').forEach((c) => c.addEventListener('click', () => { const i = c.closest('form')?.querySelector('input'); if (i) { i.value = i.value.replace(/\s*$/, '') + ', ' + c.textContent.trim(); i.focus(); } }));
  // compare checkbox → toast
  const toast = $('#toast'); let tt;
  document.addEventListener('change', (e) => { if (!e.target.closest('.pcard-foot') || !toast) return; toast.querySelector('b').textContent = e.target.checked ? 'Karşılaştırmaya eklendi' : 'Karşılaştırmadan çıkarıldı'; toast.querySelector('p').textContent = 'Karşılaştırma tepsisinden görüntüleyin.'; toast.hidden = false; clearTimeout(tt); tt = setTimeout(() => (toast.hidden = true), 2600); });
  // device bar: theme + fit
  $('#dv-theme')?.addEventListener('click', () => { const dark = (root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) !== 'dark'; root.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('arasta-theme', root.dataset.theme); } catch (e) {} });
  const stage = $('#stage'), app = $('.app'), fitBtn = $('#dv-zoom');
  function fit() { if (!stage?.dataset.w) return; const w = +stage.dataset.w; const avail = stage.clientWidth - 32; const auto = w > avail; const on = fitBtn?.getAttribute('aria-pressed') === 'true' || (auto && fitBtn?.dataset.user !== '1');
    if (on && w > avail) { const k = avail / w; app.style.transform = `scale(${k})`; stage.classList.add('fit'); stage.style.height = app.offsetHeight * k + 64 + 'px'; fitBtn && (fitBtn.textContent = '%100', fitBtn.setAttribute('aria-pressed', 'true')); }
    else { app.style.transform = ''; stage.classList.remove('fit'); stage.style.height = ''; fitBtn && (fitBtn.textContent = 'Sığdır', fitBtn.setAttribute('aria-pressed', 'false')); } }
  fitBtn?.addEventListener('click', () => { fitBtn.dataset.user = '1'; fitBtn.setAttribute('aria-pressed', fitBtn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); fit(); });
  addEventListener('resize', fit); addEventListener('load', fit); fit();
  // TV: spatial navigation with arrow keys (D-pad)
  if (root.dataset.fam === 'tv') {
    const focusables = () => $$('.app a[href], .app button, .app input, .app [tabindex="0"]').filter((el) => el.offsetParent !== null && !el.classList.contains('skip'));
    (document.querySelector('.tv-tab[aria-current]') || focusables().find((el) => !el.classList.contains('skip')))?.focus({ preventScroll: true });
    document.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key]; if (!dir || e.target.matches('input,select,textarea')) return;
      const cur = document.activeElement?.getBoundingClientRect(); if (!cur) return; e.preventDefault();
      const cx = cur.left + cur.width / 2, cy = cur.top + cur.height / 2; let best = null, bd = Infinity;
      for (const el of focusables()) { if (el === document.activeElement) continue; const r = el.getBoundingClientRect(); const x = r.left + r.width / 2 - cx, y = r.top + r.height / 2 - cy;
        if ((dir[0] && Math.sign(x) !== dir[0]) || (dir[1] && Math.sign(y) !== dir[1]) || (dir[0] && Math.abs(x) < 4) || (dir[1] && Math.abs(y) < 4)) continue;
        const d = dir[0] ? Math.abs(x) + Math.abs(y) * 2 : Math.abs(y) + Math.abs(x) * 2; if (d < bd) { bd = d; best = el; } }
      best?.focus(); best?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
})();
