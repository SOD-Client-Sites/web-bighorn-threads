import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://bighornthreads.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => ![
        '/demo/',
        '/preview/',
        '/catalog/search/',
        '/get-started/',
        '/product/',
        '/win/',
        '/404/',
        '/blog/rush-order-shirts-las-vegas-2-day-3-day-options/',
        '/blog/screen-printing-vs-embroidery-construction/',
        '/industries/construction-trades/las-vegas/',
      ].some((path) => page.includes(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
