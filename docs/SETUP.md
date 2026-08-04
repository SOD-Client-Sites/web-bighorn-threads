# Dev Environment Setup

## Prerequisites

- Node.js >= 22.12.0
- npm
- GitHub access for repository operations

## Install

```bash
cd /Users/salesondemand/dev/clients/bighorn-threads/site-marketing
npm ci
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

Reviewed pushes to `master` deploy through `.github/workflows/deploy-cloudflare-pages.yml`.
For an explicitly approved manual deployment:

```bash
npm run deploy:pages
```

## Project URLs

- **Production:** https://bighornthreads.com
- **CF Pages:** https://bighorn-threads.pages.dev
- **Parent brand:** https://www.vp-promos.com

## Contact Info (for site content)

- Phone: 702.904.8923
- Email: info@vp-promos.com
- Location: Las Vegas, NV
