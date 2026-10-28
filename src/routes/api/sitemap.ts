import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

type Bindings = { DB: D1Database }

export const Route = createFileRoute('/api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        let posts: { id: string; updated_at: number }[] = []
        try {
          // Cloudflare D1 veritabanından tüm yazıların ID ve tarihlerini çekiyoruz
          const DB = (env as unknown as Bindings).DB
          const result = await DB.prepare('SELECT id, updated_at FROM posts ORDER BY created_at DESC').all<{ id: string; updated_at: number }>()
          posts = result.results
        } catch (err) {
          console.error('Sitemap DB hatası:', err)
        }
        
        const baseUrl = 'https://semihalgan.com.tr'
        
        // Sitenizdeki sabit/statik sayfalar
        const staticPages = [
          { path: '/', priority: '1.0' },
          { path: '/yazilar', priority: '0.9' },
          { path: '/guncellemeler', priority: '0.8' },
          { path: '/kunye', priority: '0.5' },
          { path: '/kvkk', priority: '0.5' },
          { path: '/gizlilik', priority: '0.5' },
          { path: '/kullanim-kosullari', priority: '0.5' },
          { path: '/uyelik-sozlesmesi', priority: '0.5' }
        ]

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

        // Statik sayfaları XML'e ekle
        for (const page of staticPages) {
          xml += `  <url>\n`
          xml += `    <loc>${baseUrl}${page.path}</loc>\n`
          xml += `    <changefreq>weekly</changefreq>\n`
          xml += `    <priority>${page.priority}</priority>\n`
          xml += `  </url>\n`
        }

        // Dinamik blog yazılarını XML'e ekle
        for (const post of posts) {
          const date = new Date(post.updated_at).toISOString().split('T')[0]
          xml += `  <url>\n`
          xml += `    <loc>${baseUrl}/yazilar/${post.id}</loc>\n`
          xml += `    <lastmod>${date}</lastmod>\n`
          xml += `    <changefreq>monthly</changefreq>\n`
          xml += `    <priority>0.7</priority>\n`
          xml += `  </url>\n`
        }

        xml += `</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600', // 1 saat önbellek
          },
        })
      },
    },
  },
})
