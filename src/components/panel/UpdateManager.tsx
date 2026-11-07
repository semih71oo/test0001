import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, ChevronDown, ChevronUp, Pencil, Sparkles, Trash2, X } from 'lucide-react'
import { communityApi } from '../../lib/community'
import { formatDate } from '../../lib/posts'
import type { SiteUpdate } from '../../lib/posts'

export function UpdateManager() {
  const [updates, setUpdates] = useState<SiteUpdate[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function load() {
    try {
      setUpdates(await communityApi<SiteUpdate[]>('updates'))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Güncellemeler yüklenemedi.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function reset() {
    setEditing(null)
    setTitle('')
    setDescription('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('save-update', {
        id: editing ?? undefined,
        title,
        description: description.trim() || null,
      })
      setNotice(editing ? 'Güncelleme kaydı düzenlendi.' : 'Yeni güncelleme yayınlandı.')
      reset()
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Güncelleme kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(item: SiteUpdate) {
    setDeleting(null)
    setEditing(item.id)
    setTitle(item.title)
    setDescription(item.description ?? '')
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id: number) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('delete-update', { id })
      if (editing === id) reset()
      setDeleting(null)
      setNotice('Güncelleme kaydı silindi.')
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Silme işlemi yapılamadı.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="management-grid">
      <section className="panel-card management-form">
        <span className="panel-card-icon">
          <Sparkles size={21} />
        </span>
        <h2>{editing ? `Güncelleme #${editing} Düzenle` : 'Yeni Güncelleme Ekle'}</h2>
        <p className="card-description">
          Sitede yapılan yenilikleri, düzeltmeleri veya duyuruları ziyaretçilerle paylaş.
        </p>
        <form className="account-form" onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="form-field">
              <label htmlFor="update-title">Güncelleme Konusu / Başlık *</label>
              <input
                id="update-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                minLength={2}
                maxLength={150}
                placeholder="Örn: Yorum düzenleme özelliği & hata düzeltmeleri"
              />
            </div>
            <div className="form-field">
              <label htmlFor="update-desc">Detaylı Açıklama (İsteğe bağlı)</label>
              <textarea
                id="update-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Güncellemenin detayları, eklenen yeni özellikler veya notlar…"
                style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit' }}
              />
              <span className="field-hint">
                Ziyaretçiler güncelleme sayfasına girdiğinde bu açıklamayı tıklandığında açılır-kapanır şekilde görebilir.
              </span>
            </div>
            <div className="form-feedback" aria-live="polite">
              {error && <p className="message message-error" role="alert">{error}</p>}
              {notice && <p className="message message-success" role="status">{notice}</p>}
            </div>
            <button className="button button-primary form-submit" type="submit">
              {busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Güncellemeyi Yayınla'}
              <Check size={17} />
            </button>
            {editing && (
              <button className="text-action cancel-edit" type="button" onClick={reset}>
                <X size={15} />
                Düzenlemeyi iptal et
              </button>
            )}
          </fieldset>
        </form>
      </section>

      <section className="panel-card roster-card">
        <div className="list-heading">
          <h2>Yayınlanan Güncellemeler</h2>
          <span>{updates.length} güncelleme</span>
        </div>
        {!updates.length ? (
          <div className="list-empty">
            <Sparkles size={30} />
            <p>Henüz bir güncelleme eklenmedi.</p>
            <span>İlk yeniliği soldaki formdan yayınlayabilirsin.</span>
          </div>
        ) : (
          <ul className="developer-list">
            {updates.map(item => (
              <li key={item.id} style={{ display: 'block', paddingBlock: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#255b43',
                        color: '#d5ee91',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      ID #{item.id}
                    </span>
                    <strong style={{ margin: 0, fontSize: '0.95rem' }}>{item.title}</strong>
                  </div>
                  <div className="row-actions">
                    {deleting === item.id ? (
                      <>
                        <span className="delete-prompt">Silinsin mi?</span>
                        <button className="danger-button" type="button" disabled={busy} onClick={() => remove(item.id)}>
                          Sil
                        </button>
                        <button className="icon-button" type="button" aria-label="İptal" onClick={() => setDeleting(null)}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="icon-button"
                          type="button"
                          title="Düzenle"
                          disabled={busy}
                          onClick={() => startEdit(item)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          title="Sil"
                          disabled={busy}
                          onClick={() => setDeleting(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <small style={{ opacity: 0.65 }}>Tarih: {formatDate(item.createdAt)}</small>
                  {item.description && (
                    <button
                      type="button"
                      className="text-action"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {expandedId === item.id ? (
                        <>Detayı gizle <ChevronUp size={13} /></>
                      ) : (
                        <>Detayı gör <ChevronDown size={13} /></>
                      )}
                    </button>
                  )}
                </div>

                {expandedId === item.id && item.description && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: '#f4f6ee',
                      borderRadius: 8,
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      border: '1px solid #dbe4cd',
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
