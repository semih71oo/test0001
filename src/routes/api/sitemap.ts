import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { softwareList } from '../../lib/software'

type Bindings = { DB: D1Database }

const SITE_URL = 'https://semihalgan.com.tr'

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function sitemapDate(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export const Route = createFileRoute('/api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        const DB = (env as unknown as Bindings).DB

        // posts tablosu mevcut şemada herkese açık yazıları tutar.
        // Proje detayları D1 tablosunda değil, src/lib/software.ts içinde tanımlıdır.
        let posts: { id: string; updated_at: number }[]
        try {
          const result = await DB.prepare(
            'SELECT id, updated_at FROM posts ORDER BY created_at DESC',
          ).all<{ id: string; updated_at: number }>()
          posts = result.results ?? []
        } catch (error) {
          console.error('Sitemap için D1 yazıları okunamadı:', error)
          return new Response('Sitemap geçici olarak oluşturulamadı.', {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store',
            },
          })
        }

        const staticPages = [
          '/',
          '/yazilar',
          '/guncellemeler',
          '/yazilimlar',
          '/kunye',
          '/kvkk',
          '/gizlilik',
          '/kullanim-kosullari',
          '/uyelik-sozlesmesi',
        ]

        const urls: string[] = []

        for (const path of staticPages) {
          urls.push(`  <url><loc>${SITE_URL}${path}</loc></url>`)
        }

        // Sadece yayındaki ve ana sitede gerçek detay sayfası bulunan projeler.
        for (const project of softwareList) {
          if (project.status !== 'Yayında') continue
          urls.push(`  <url><loc>${SITE_URL}${xmlEscape(project.href)}</loc></url>`)
        }

        for (const post of posts) {
          const lastmod = sitemapDate(post.updated_at)
          const loc = `${SITE_URL}/yazilar/${encodeURIComponent(post.id)}`
          urls.push(
            lastmod
              ? `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
              : `  <url><loc>${loc}</loc></url>`,
          )
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          '</urlset>',
        ].join('\n')

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            // Tarayıcıda yeniden doğrula; Cloudflare edge'de 1 saat tut.
            'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
            'X-Content-Type-Options': 'nosniff',
          },
        })
      },
    },
  },
})
