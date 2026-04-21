import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://bighornthreads.com',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => ![
        '/demo/',
        '/preview/',
        '/catalog/search/',
      ].some((path) => page.includes(path)) && !page.includes('/product?'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
