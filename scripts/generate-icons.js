import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.resolve('public')

// Master SVG: Premium, simple, iconic FEU Green & Gold Tamaraw Academic insignia
// Designed specifically for iOS home screen squircle & Android adaptive icons
const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Rich FEU Heritage Forest Green Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e3f28" />
      <stop offset="45%" stop-color="#08291a" />
      <stop offset="100%" stop-color="#04170e" />
    </linearGradient>

    <!-- Center Radial Glow for Depth -->
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#165b3b" stop-opacity="0.5" />
      <stop offset="60%" stop-color="#0e3f28" stop-opacity="0" />
      <stop offset="100%" stop-color="#04170e" stop-opacity="0" />
    </radialGradient>

    <!-- FEU Brilliant Gold Gradient -->
    <linearGradient id="feuGold" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#fff1a8" />
      <stop offset="25%" stop-color="#fcd34d" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Warm Amber Accent Gradient -->
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Subtle Emerald Shield Gradient -->
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c3421" />
      <stop offset="100%" stop-color="#061c11" />
    </linearGradient>

    <!-- Soft Drop Shadows -->
    <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.55" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4" />
    </filter>

    <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#f59e0b" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Full Bleed Square (NO rx) - Crucial for iOS PWA to avoid black corner artifacts -->
  <rect width="512" height="512" fill="url(#bgGrad)" />
  <rect width="512" height="512" fill="url(#centerGlow)" />

  <!-- Subtle Inset Hairline Border -->
  <rect x="20" y="20" width="472" height="472" fill="none" stroke="url(#feuGold)" stroke-width="1.5" stroke-opacity="0.22" />

  <!-- Main Insignia Group with Depth Shadow -->
  <g filter="url(#heroShadow)">
    <!-- Academic Shield Crest Silhouette -->
    <path
      d="M256 84
         L382 128
         C382 248 322 352 256 404
         C190 352 130 248 130 128
         Z"
      fill="url(#shieldGrad)"
      stroke="url(#feuGold)"
      stroke-width="7"
      stroke-linejoin="round"
    />

    <!-- Inner Shield Accent Line -->
    <path
      d="M256 102
         L364 140
         C364 242 312 334 256 380
         C200 334 148 242 148 140
         Z"
      fill="none"
      stroke="url(#feuGold)"
      stroke-width="1.75"
      stroke-opacity="0.3"
      stroke-linejoin="round"
    />

    <!-- Iconic Sculptural Tamaraw "T" Monogram -->
    <!-- Top Horizontal Bar with Beveled Ends -->
    <path
      d="M174 168
         C174 168 206 162 256 162
         C306 162 338 168 338 168
         L338 204
         C312 198 290 196 274 196
         L274 340
         L238 340
         L238 196
         C222 196 200 198 174 204
         Z"
      fill="url(#feuGold)"
    />

    <!-- Tamaraw Horn Crescent Left Curve (Valor & Strength) -->
    <path
      d="M238 214
         C200 220 178 242 178 274
         C178 300 194 318 216 326
         C202 314 196 298 196 280
         C196 254 212 232 238 226
         Z"
      fill="url(#goldAccent)"
      opacity="0.9"
    />

    <!-- Tamaraw Horn Crescent Right Curve (Excellence & Fortitude) -->
    <path
      d="M274 214
         C312 220 334 242 334 274
         C334 300 318 318 296 326
         C310 314 316 298 316 280
         C316 254 300 232 274 226
         Z"
      fill="url(#goldAccent)"
      opacity="0.9"
    />

    <!-- Academic 4.0 Honor Star / Four-Point Diamond at Top Center -->
    <g filter="url(#starGlow)">
      <path
        d="M256 118
           L261 131
           L274 136
           L261 141
           L256 154
           L251 141
           L238 136
           L251 131
           Z"
        fill="#ffffff"
      />
      <circle cx="256" cy="136" r="2.5" fill="#f59e0b" />
    </g>

    <!-- Bottom Checkmark Quality Seal (Zero-Based Mastery) -->
    <circle cx="340" cy="336" r="24" fill="#09281a" stroke="url(#feuGold)" stroke-width="3.5" />
    <path
      d="M331 336
         L337 342
         L350 329"
      fill="none"
      stroke="url(#feuGold)"
      stroke-width="4.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`

// Maskable version with extra padding for Android adaptive icons
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e3f28" />
      <stop offset="50%" stop-color="#08291a" />
      <stop offset="100%" stop-color="#04170e" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#mBgGrad)" />
  <g transform="translate(51.2, 51.2) scale(0.8)">
    ${masterSvg.substring(masterSvg.indexOf('<defs>'), masterSvg.lastIndexOf('</svg>'))}
  </g>
</svg>`

async function generateAllIcons() {
  console.log('Generating high-resolution PWA & iOS app icons...')

  // Save master SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterSvg, 'utf-8')
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterSvg, 'utf-8')
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg, 'utf-8')

  const svgBuffer = Buffer.from(masterSvg)
  const maskableBuffer = Buffer.from(maskableSvg)

  // 1. Apple Touch Icons (iOS PWA)
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon-180x180.png'))
  await sharp(svgBuffer).resize(167, 167).png().toFile(path.join(publicDir, 'apple-touch-icon-167x167.png'))
  await sharp(svgBuffer).resize(152, 152).png().toFile(path.join(publicDir, 'apple-touch-icon-152x152.png'))
  await sharp(svgBuffer).resize(120, 120).png().toFile(path.join(publicDir, 'apple-touch-icon-120x120.png'))

  // 2. Standard Web App Manifest Icons
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'))
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'))
  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-maskable.png'))

  // 3. Favicon PNG
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'))
  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'))

  console.log('Successfully generated all iOS apple-touch-icons and PWA manifest assets!')
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
