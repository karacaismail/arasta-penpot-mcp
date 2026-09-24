import { PNG } from 'pngjs'; import fs from 'node:fs';
const [, , f, sh = '1400', maxW = '0'] = process.argv;
const src = PNG.sync.read(fs.readFileSync(f)); const H = +sh; let i = 0;
for (let y = 0; y < src.height; y += H, i++) {
  const h = Math.min(H, src.height - y); const out = new PNG({ width: src.width, height: h });
  PNG.bitblt(src, out, 0, y, src.width, h, 0, 0); const o = f.replace(/\.png$/, `-${i}.png`); fs.writeFileSync(o, PNG.sync.write(out)); console.log(o);
}
