# Dev Environment Setup

## Prerequisites

- Node.js >= 22.12.0
- npm
- Wrangler CLI (`npm install -g wrangler`)

## Install

```bash
cd C:\dev\sites\bighorn-threads
npm install
```

## Development

```bash
npm run dev
# Opens at http://localhost:4321
```

## Build

```bash
npm run build
# Output in dist/
```

## Preview Production Build

```bash
npm run preview
```

## Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist
```

## Project URLs

- **Production:** https://bighornthreads.com (TBD)
- **CF Pages:** https://bighorn-threads.pages.dev (after first deploy)
- **Parent brand:** https://www.vp-promos.com

## Contact Info (for site content)

- Phone: 725.235.6196
- Email: info@vp-promos.com
- Location: Las Vegas, NV
