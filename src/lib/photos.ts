/* Representative site imagery, drawn as SVG so the prototype works offline.
   These are illustrations, not real job photographs. */

const noise = (id: string, freq = 0.9, op = 0.35) => `
<filter id="${id}" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>
  <feColorMatrix in="n" type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="table" tableValues="0 ${op}"/></feComponentTransfer>
  <feBlend in="SourceGraphic" mode="multiply"/>
</filter>`

const wrap = (body: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs>${noise('g')}${noise('f', 0.03, 0.5)}${defs}</defs>${body}</svg>`

const concrete = (top: string, bot: string) =>
  `<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`

const sky = `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3e6"/><stop offset="1" stop-color="#e8eef3"/></linearGradient>`

const terraceBase = (floor = '#b9b3a8', floor2 = '#8f887c') =>
  `<rect width="400" height="300" fill="url(#s)"/>
   <rect x="0" y="70" width="400" height="40" fill="#cfc8bb" filter="url(#g)"/>
   <rect x="0" y="66" width="400" height="6" fill="#e6e0d4"/>
   <polygon points="0,110 400,110 400,300 0,300" fill="url(#c)" filter="url(#g)"/>
   <defs>${concrete(floor, floor2)}</defs>`

const S: Record<string, string> = {
  // customer-side
  ceilingDamp: wrap(`
    <rect width="400" height="300" fill="#efe9df" filter="url(#g)"/>
    <ellipse cx="250" cy="110" rx="150" ry="95" fill="#c9b48e" opacity=".55" filter="url(#f)"/>
    <ellipse cx="240" cy="105" rx="95" ry="60" fill="#a88b5c" opacity=".5" filter="url(#f)"/>
    <ellipse cx="230" cy="100" rx="45" ry="28" fill="#7e6440" opacity=".45"/>
    <path d="M150 60 q40 30 20 70 q-10 30 30 50" stroke="#8a7350" stroke-width="2" fill="none" opacity=".5"/>
    <rect x="0" y="250" width="400" height="50" fill="#ddd5c6"/>
    <rect x="0" y="246" width="400" height="6" fill="#f7f3ec"/>`),
  wallPeel: wrap(`
    <rect width="400" height="300" fill="#e9e3d6" filter="url(#g)"/>
    <path d="M60 40 q60 -10 110 30 q40 40 120 20 q50 -10 70 60 l0 120 q-90 30 -180 0 q-70 -20 -120 10z" fill="#c4b18c" opacity=".55" filter="url(#f)"/>
    <path d="M140 110 l30 -18 l26 22 l-8 30 l-34 6z" fill="#f6f2ea" stroke="#b8a682"/>
    <path d="M220 150 l40 -10 l14 28 l-30 18z" fill="#f6f2ea" stroke="#b8a682"/>
    <circle cx="120" cy="190" r="22" fill="#6c7a52" opacity=".35" filter="url(#f)"/>`),
  terraceCrack: wrap(`${terraceBase()}
    <path d="M40 300 L95 240 L120 250 L170 190 L210 196 L260 140 L300 150 L360 112" stroke="#3a342c" stroke-width="3" fill="none"/>
    <path d="M170 190 L150 160 M260 140 L250 118" stroke="#3a342c" stroke-width="1.5" fill="none"/>
    <ellipse cx="300" cy="230" rx="70" ry="22" fill="#6b6658" opacity=".35"/>`, sky),
  terraceCorner: wrap(`
    <rect width="400" height="300" fill="#ddd6ca" filter="url(#g)"/>
    <polygon points="0,0 230,0 230,300 0,300" fill="#cdc5b6" filter="url(#g)"/>
    <polygon points="0,200 400,170 400,300 0,300" fill="#9e9688" filter="url(#g)"/>
    <ellipse cx="220" cy="210" rx="90" ry="26" fill="#5e6a4a" opacity=".45" filter="url(#f)"/>
    <path d="M226 0 L226 190" stroke="#4b443a" stroke-width="2"/>
    <circle cx="300" cy="230" r="14" fill="#3a3a3a"/><circle cx="300" cy="230" r="9" fill="#1d1d1d"/>`),

  // stage evidence
  clean1: wrap(`${terraceBase('#c6c1b7', '#a29b8f')}
    <path d="M60 300 L160 150 L200 150 L140 300z" fill="#d9d5cd" opacity=".7"/>
    <rect x="230" y="150" width="14" height="110" rx="3" fill="#2f5d9e"/><rect x="200" y="250" width="70" height="18" rx="4" fill="#1d3f70"/>
    <ellipse cx="250" cy="270" rx="70" ry="10" fill="#8ab2d9" opacity=".5"/>`, sky),
  clean2: wrap(`${terraceBase('#cbc6bd', '#a7a094')}
    <circle cx="120" cy="200" r="5" fill="#9fb2c4" opacity=".7"/><circle cx="160" cy="230" r="4" fill="#9fb2c4" opacity=".7"/>
    <rect x="260" y="160" width="80" height="60" rx="6" fill="#e4572e" opacity=".9"/><rect x="270" y="150" width="60" height="14" rx="4" fill="#b03a1c"/>`, sky),
  crack1: wrap(`
    <rect width="400" height="300" fill="#a8a196" filter="url(#g)"/>
    <path d="M0 160 C80 150 120 175 200 150 S330 140 400 155" stroke="#6b665d" stroke-width="16" fill="none"/>
    <path d="M0 160 C80 150 120 175 200 150 S330 140 400 155" stroke="#2c2924" stroke-width="5" fill="none"/>
    <rect x="250" y="40" width="120" height="30" rx="6" fill="#e9b52a"/><rect x="260" y="48" width="60" height="14" fill="#333"/>`),
  crack2: wrap(`
    <rect width="400" height="300" fill="#aea79b" filter="url(#g)"/>
    <path d="M0 160 C80 150 120 175 200 150 S330 140 400 155" stroke="#d8d3c8" stroke-width="18" fill="none"/>
    <path d="M0 160 C80 150 120 175 200 150 S330 140 400 155" stroke="#bfb9ac" stroke-width="6" fill="none" stroke-dasharray="2 6"/>`),
  drain1: wrap(`
    <rect width="400" height="300" fill="#a39c90" filter="url(#g)"/>
    <circle cx="200" cy="160" r="70" fill="#c9c3b8" filter="url(#g)"/>
    <circle cx="200" cy="160" r="38" fill="#4a4a4a"/><circle cx="200" cy="160" r="28" fill="#1e1e1e"/>
    <g stroke="#6a6a6a" stroke-width="4">${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${172 + i * 11}" y1="135" x2="${172 + i * 11}" y2="185"/>`).join('')}</g>`),
  slope1: wrap(`${terraceBase('#bdb6aa', '#948d80')}
    <rect x="80" y="200" width="240" height="14" rx="3" fill="#f0c419"/><rect x="190" y="202" width="20" height="10" fill="#2e7d32" opacity=".8"/>
    <path d="M60 280 L340 240" stroke="#2f5d9e" stroke-width="3" stroke-dasharray="8 6"/>`, sky),
  mix1: wrap(`
    <rect width="400" height="300" fill="#9f988c" filter="url(#g)"/>
    <ellipse cx="200" cy="170" rx="120" ry="40" fill="#555"/>
    <path d="M80 170 L100 280 L300 280 L320 170z" fill="#e8e8e8" filter="url(#g)"/>
    <ellipse cx="200" cy="170" rx="118" ry="38" fill="#cfd6db"/>
    <path d="M130 170 q70 -30 140 0" stroke="#aab4bb" stroke-width="5" fill="none"/>
    <rect x="195" y="20" width="10" height="150" fill="#555"/><path d="M180 160 h40 l-8 18 h-24z" fill="#333"/>`),
  batch1: wrap(`
    <rect width="400" height="300" fill="#a49d91" filter="url(#g)"/>
    <rect x="110" y="40" width="180" height="230" rx="16" fill="#f6f6f6"/>
    <rect x="110" y="80" width="180" height="60" fill="#45237f"/><rect x="110" y="140" width="180" height="10" fill="#f47b20"/>
    <rect x="130" y="170" width="140" height="10" rx="3" fill="#ccc"/><rect x="130" y="190" width="100" height="10" rx="3" fill="#ccc"/>
    <rect x="130" y="220" width="90" height="30" fill="#fff" stroke="#999"/>
    <g fill="#222">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${134 + i * 7}" y="224" width="${i % 3 ? 2 : 4}" height="22"/>`).join('')}</g>`),
  coat1: wrap(`
    <rect width="400" height="300" fill="#b0a99d" filter="url(#g)"/>
    <polygon points="0,120 400,90 400,300 0,300" fill="#e6e9ec" filter="url(#g)"/>
    <polygon points="0,120 400,90 400,110 0,140" fill="#cdd3d8"/>
    <rect x="250" y="130" width="22" height="120" rx="6" fill="#f47b20" transform="rotate(25 260 190)"/>
    <rect x="200" y="230" width="90" height="26" rx="8" fill="#ddd" transform="rotate(25 245 243)"/>`),
  gauge1: wrap(`
    <rect width="400" height="300" fill="#dfe3e6" filter="url(#g)"/>
    <rect x="90" y="110" width="220" height="80" rx="10" fill="#c0c7cc" stroke="#7d8890" stroke-width="2"/>
    <g fill="#3d4a54">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${108 + i * 25}" y="${i % 2 ? 150 : 140}" width="10" height="${i % 2 ? 40 : 50}"/>`).join('')}</g>
    <text x="200" y="232" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#3d4a54">1.6 mm</text>`),
  membrane1: wrap(`
    <rect width="400" height="300" fill="url(#s)"/>
    <polygon points="0,100 400,80 400,300 0,300" fill="#e9edf0" filter="url(#g)"/>
    <path d="M0 100 L400 80" stroke="#c9d0d5" stroke-width="10"/>
    <path d="M0 102 C60 140 60 140 0 180" fill="#dde3e7"/>
    <rect x="300" y="60" width="18" height="40" fill="#cfc8bb"/>`, sky),
  audit1: wrap(`
    <rect width="400" height="300" fill="#e7ebee" filter="url(#g)"/>
    <rect x="120" y="60" width="160" height="200" rx="10" fill="#fff" stroke="#c7cdd2"/>
    <rect x="140" y="80" width="120" height="12" rx="3" fill="#45237f"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="140" y="${110 + i * 26}" width="14" height="14" rx="3" fill="#2e9e5b"/><path d="M143 ${117 + i * 26} l4 4 l7 -8" stroke="#fff" stroke-width="2" fill="none"/><rect x="162" y="${113 + i * 26}" width="${70 + (i % 3) * 12}" height="8" rx="3" fill="#cfd5da"/>`).join('')}`),
  pond1: wrap(`${terraceBase('#b7b0a4', '#8f887c')}
    <polygon points="0,140 400,140 400,300 0,300" fill="#6fa3cf" opacity=".55"/>
    <path d="M30 190 q30 -6 60 0 t60 0 M210 230 q30 -6 60 0 t60 0 M90 270 q30 -6 60 0 t60 0" stroke="#e8f2fa" stroke-width="3" fill="none" opacity=".8"/>
    <rect x="320" y="150" width="6" height="60" fill="#f47b20"/><text x="332" y="168" font-family="sans-serif" font-size="12" fill="#22113f">50 mm</text>`, sky),
  ceiling1: wrap(`
    <rect width="400" height="300" fill="#f4f1ea" filter="url(#g)"/>
    <rect x="0" y="250" width="400" height="50" fill="#e4ddcf"/><rect x="0" y="246" width="400" height="6" fill="#fbf9f4"/>
    <circle cx="200" cy="120" r="44" fill="#fff" stroke="#e1dbcf"/><circle cx="200" cy="120" r="12" fill="#f6efe0"/>
    <rect x="290" y="40" width="80" height="34" rx="8" fill="#2e9e5b"/><text x="330" y="62" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff">DRY</text>`),

  // claims
  claimLeak: wrap(`
    <rect width="400" height="300" fill="#f1ece2" filter="url(#g)"/>
    <ellipse cx="120" cy="80" rx="70" ry="40" fill="#b79c6e" opacity=".5" filter="url(#f)"/>
    <path d="M120 100 q-4 40 6 80" stroke="#8c7246" stroke-width="3" fill="none" opacity=".6"/>
    <rect x="0" y="250" width="400" height="50" fill="#e0d8c8"/>`),
  claimPipe: wrap(`
    <rect width="400" height="300" fill="#ece6da" filter="url(#g)"/>
    <rect x="60" y="0" width="26" height="300" fill="#d8d8d8"/><rect x="56" y="140" width="34" height="18" fill="#bdbdbd"/>
    <ellipse cx="150" cy="170" rx="80" ry="60" fill="#a88b5c" opacity=".45" filter="url(#f)"/>
    <path d="M90 150 q20 10 18 40" stroke="#6e8fb0" stroke-width="3" fill="none"/>`),
}

const cache: Record<string, string> = {}
export function photo(key: string): string {
  if (key.startsWith('data:')) return key
  if (!cache[key]) cache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S[key] || S.terraceCrack)
  return cache[key]
}

export const SAMPLE_UPLOADS = ['ceilingDamp', 'wallPeel', 'terraceCrack', 'terraceCorner']

/** Downscale a user upload so it can live in localStorage. */
export function compressImage(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * r)
      c.height = Math.round(img.height * r)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not a readable image')) }
    img.src = url
  })
}
