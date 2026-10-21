# ShieldTX Scanner

Wallet scanner landing page, locked and unlocked reports, animated wallet files, and shareable exposure cards.

## Deployment
Import `eeshitaaa/scanner` into Vercel. Framework: Other. Output: `public`. No build or installation required. Node 22 functions handle sharing.

## Share-image storage
The website and share URLs run on Vercel. The existing public ShieldTX Sites backend stores the exact exported PNG in its R2 bucket. `api/share.js` forwards image uploads to this existing service; `api/card.js` serves saved images and rewrites server-rendered social metadata to the Vercel origin. Keep that backend online. This preserves existing shared cards without moving storage or adding credentials.

The backend origin is https://shieldtx-scanner-simple.eeshita7546.chatgpt.site . Report samples and illustrative estimates retain their labels.

## Source
`public/`: HTML, CSS, JS, and assets. `api/`: Vercel share adapters. Run `npm run check` for syntax checks. Changes pushed to main automatically deploy through the connected Vercel project.
