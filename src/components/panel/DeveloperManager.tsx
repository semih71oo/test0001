import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Code2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { communityApi, developerRoles } from '../../lib/community'
import type { Developer, DeveloperRole } from '../../lib/community'
import { RoleBadge } from '../DeveloperBoard'

function Feedback({ error, notice }: { error: string; notice?: string }) {
  return (
    <div className="form-feedback" aria-live="polite">
      {error && <p className="message message-error" role="alert">{error}</p>}
      {notice && <p className="message message-success" role="status">{notice}</p>}
    </div>
  )
}

export function DeveloperManager({
  developers,
  refresh,
}: {
  developers: Developer[]
  refresh: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<DeveloperRole>('Developer')
  const [editing, setEditing] = useState<string | undefined>()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function reset() {
    setName('')
    setRole('Developer')
    setEditing(undefined)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('save-developer', { name, role, ...(editing ? { id: editing } : {}) })
      reset()
      setNotice('Geliştirici panosu güncellendi.')
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Kayıt yapılamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('delete-developer', { id })
      if (editing === id) reset()
      setDeleting(null)
      setNotice('Geliştirici panodan kaldırıldı.')
      await refresh()
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
          <Plus size={21} />
        </span>
        <h2>{editing ? 'Geliştiriciyi düzenle' : 'Panoya bir isim ekle'}</h2>
        <p className="card-description">
          İsim ve rol herkese açık panoda görünür. Bu seçim hesap yetkisi vermez.
        </p>
        <form className="account-form" onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="form-field">
              <label htmlFor="developer-name">Ad soyad / görünen isim</label>
              <input
                id="developer-name"
                value={name}
                onChange={event => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Geliştiricinin ismi"
              />
            </div>
            <div className="form-field">
              <label htmlFor="developer-role">Pano rolü</label>
              <select
                id="developer-role"
                value={role}
                onChange={event => setRole(event.target.value as DeveloperRole)}
              >
                {developerRoles.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <Feedback error={error} notice={notice} />
            <button className="button button-primary form-submit" type="submit">
              {busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Geliştirici ekle'}
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
          <h2>Panodaki isimler</h2>
          <span>{developers.length} geliştirici</span>
        </div>
        {!developers.length ? (
          <div className="list-empty">
            <Code2 size={30} />
            <p>Henüz bir isim eklenmedi.</p>
            <span>İlk geliştiriciyi soldaki formdan ekle.</span>
          </div>
        ) : (
          <ul className="developer-list">
            {developers.map(developer => (
              <li key={developer.id}>
                <div>
                  <strong>{developer.name}</strong>
                  <RoleBadge role={developer.role} />
                </div>
                <div className="row-actions">
                  {deleting === developer.id ? (
                    <>
                      <span className="delete-prompt">Kaldırılsın mı?</span>
                      <button
                        className="danger-button"
                        type="button"
                        disabled={busy}
                        onClick={() => remove(developer.id)}
                      >
                        Kaldır
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label="Silmeyi iptal et"
                        onClick={() => setDeleting(null)}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`${developer.name} düzenle`}
                        disabled={busy}
                        onClick={() => {
                          setEditing(developer.id)
                          setName(developer.name)
                          setRole(developer.role)
                          setError('')
                          setNotice('')
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`${developer.name} panodan kaldır`}
                        disabled={busy}
                        onClick={() => setDeleting(developer.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
