import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { communityApi } from '../lib/community'
import { formatDate } from '../lib/posts'
import type { SiteUpdate } from '../lib/posts'

export const Route = createFileRoute('/guncellemeler')({
  component: UpdatesPage,
  head: () => ({
    meta: [
      { title: 'Güncellemeler — Semih Algan' },
      { name: 'description', content: 'Semih Algan web sitesinde yapılan yenilikler, güncellemeler ve sürüm notları.' },
    ],
  }),
})

function UpdatesPage() {
  const [updates, setUpdates] = useState<SiteUpdate[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true
    communityApi<SiteUpdate[]>('updates')
      .then(data => {
        if (active) {
          setUpdates(data)
          setState('ready')
          // En son yayınlanan güncellemeyi varsayılan olarak açık getir
          if (data.length > 0) {
            setOpenIds({ [data[0].id]: true })
          }
        }
      })
      .catch(() => {
        if (active) setState('error')
      })
    return () => {
      active = false
    }
  }, [])

  const toggleOpen = (id: number) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PublicShell>
      <div className="updates-hero">
        <span className="section-eyebrow">SÜRÜM & GELİŞTİRME NOTLARI</span>
        <h1 style={{ margin: '8px 0 16px' }}>
          Güncellemeler<span className="heading-dot">.</span>
        </h1>
        <p className="board-description" style={{ marginBottom: 32 }}>
          Sitede yapılan yenilikler, eklenen özellikler ve iyileştirmelerin zaman çizgisi.
        </p>
      </div>

      {state === 'loading' && <p role="status">Güncellemeler yükleniyor…</p>}
      {state === 'error' && (
        <p className="message message-error" role="alert">
          Güncellemeler şu an yüklenemiyor. Lütfen bağlantını kontrol edip tekrar dene.
        </p>
      )}
      {state === 'ready' && !updates.length && (
        <div className="board-empty">
          <Sparkles size={28} />
          <h3>Henüz bir güncelleme kaydı yok.</h3>
          <p>Yapılan yenilikler ve geliştirme notları yakında burada listelenecek.</p>
        </div>
      )}

      {state === 'ready' && updates.length > 0 && (
        <div className="updates-timeline">
          {updates.map(item => {
            const isOpen = !!openIds[item.id]
            const hasDescription = !!item.description?.trim()

            return (
              <article key={item.id} className="update-item">
                <div className="update-marker" aria-hidden="true">
                  <span className="update-marker-dot" />
                </div>
                <div className="panel-card update-card">
                  <div className="update-card-top">
                    <div className="update-meta">
                      <span className="update-id-badge">ID #{item.id}</span>
                      <span className="update-date">
                        <Calendar size={13} />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <h2 className="update-title">{item.title}</h2>

                  {hasDescription ? (
                    <div className="update-accordion">
                      <button
                        type="button"
                        className="update-toggle-btn"
                        onClick={() => toggleOpen(item.id)}
                        aria-expanded={isOpen}
                      >
                        <span>{isOpen ? 'Detayları gizle' : 'Detayları göster'}</span>
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>

                      {isOpen && (
                        <div className="update-body">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PublicShell>
  )
                      }
