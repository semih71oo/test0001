import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Check, FileText, ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { communityApi } from '../lib/community'
import { formatDay, imageUrl } from '../lib/posts'
import type { PostDetail, PostSummary } from '../lib/posts'

// Fotoğrafı tarayıcıda küçültüp JPEG'e çevirir (veritabanına sığması için ~850 KB altı).
async function compressImage(file: File): Promise<string> {
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw new Error('Fotoğraf okunamadı. Başka bir fotoğraf dene.') }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Fotoğraf işlenemedi.')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  for (const quality of [0.85, 0.75, 0.65, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= 850_000) return url
  }
  throw new Error('Fotoğraf çok büyük. Daha küçük bir fotoğraf seç.')
}

export function PostManager() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [existingVersion, setExistingVersion] = useState<number | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    try { setPosts(await communityApi<PostSummary[]>('posts')) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Yazılar yüklenemedi.') }
  }
  useEffect(() => { void load() }, [])

  function reset() {
    setEditing(null); setTitle(''); setBody(''); setImage(null); setExistingVersion(null); setRemoveImage(false)
  }

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    try { setImage(await compressImage(file)); setRemoveImage(false) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Fotoğraf eklenemedi.') }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      await communityApi('save-post', { id: editing ?? undefined, title, body, image, removeImage })
      setNotice(editing ? 'Yazı güncellendi.' : 'Yazı yayınlandı.')
      reset()
      await load()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Yazı kaydedilemedi.') }
    finally { setBusy(false) }
  }

  async function startEdit(id: string) {
    setError(''); setNotice('')
    try {
      const post = await communityApi<PostDetail>(`post?id=${encodeURIComponent(id)}`)
      setEditing(id); setTitle(post.title); setBody(post.body); setImage(null); setRemoveImage(false)
      setExistingVersion(post.hasImage ? post.updatedAt : null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Yazı açılamadı.') }
  }

  async function remove(id: string) {
    setBusy(true); setError(''); setNotice('')
    try {
      await communityApi('delete-post', { id })
      if (editing === id) reset()
      setDeleting(null)
      setNotice('Yazı, yorumları ve beğenileriyle birlikte silindi.')
      await load()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Yazı silinemedi.') }
    finally { setBusy(false) }
  }

  const preview = image ?? (existingVersion !== null && !removeImage && editing ? imageUrl(editing, existingVersion) : null)

  return <div className="management-grid">
    <section className="panel-card management-form">
      <span className="panel-card-icon"><FileText size={21} /></span>
      <h2>{editing ? 'Yazıyı düzenle' : 'Yeni yazı'}</h2>
      <p className="card-description">Başlık, fotoğraf ve metin /yazilar sayfasında herkese açık görünür.</p>
      <form className="account-form" onSubmit={save}>
        <fieldset disabled={busy}>
          <div className="form-field"><label htmlFor="post-title">Başlık</label><input id="post-title" value={title} onChange={event => setTitle(event.target.value)} required minLength={3} maxLength={120} placeholder="Yazının başlığı" /></div>
          <div className="form-field">
            <label htmlFor="post-image">Fotoğraf (isteğe bağlı)</label>
            {preview && <img src={preview} alt="Seçilen fotoğraf önizlemesi" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />}
            <input id="post-image" type="file" accept="image/*" onChange={pick} />
            {preview && <button type="button" className="text-action" onClick={() => { setImage(null); setRemoveImage(true) }}><X size={15} />Fotoğrafı kaldır</button>}
          </div>
          <div className="form-field"><label htmlFor="post-body">Metin</label><textarea id="post-body" value={body} onChange={event => setBody(event.target.value)} required maxLength={10000} rows={9} placeholder="Yazını buraya yaz…" style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit' }} /></div>
          <div className="form-feedback" aria-live="polite">{error && <p className="message message-error" role="alert">{error}</p>}{notice && <p className="message message-success" role="status">{notice}</p>}</div>
          <button className="button button-primary form-submit" type="submit">{busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Yayınla'}<Check size={17} /></button>
          {editing && <button className="text-action cancel-edit" type="button" onClick={reset}><X size={15} />Düzenlemeyi iptal et</button>}
        </fieldset>
      </form>
    </section>
    <section className="panel-card roster-card">
      <div className="list-heading"><h2>Yayındaki yazılar</h2><span>{posts.length} yazı</span></div>
      {!posts.length ? <div className="list-empty"><FileText size={30} /><p>Henüz yazı yok.</p><span>İlk yazını formdan yayınla.</span></div> : <ul className="developer-list">{posts.map(post => <li key={post.id}>
        <div><strong>{post.title}</strong><small style={{ display: 'block', opacity: .65 }}>{formatDay(post.createdAt)} · {post.likes} beğeni · {post.comments} yorum</small></div>
        <div className="row-actions">{deleting === post.id ? <><span className="delete-prompt">Silinsin mi?</span><button className="danger-button" type="button" disabled={busy} onClick={() => remove(post.id)}>Sil</button><button className="icon-button" type="button" aria-label="Silmeyi iptal et" onClick={() => setDeleting(null)}><X size={16} /></button></> : <><button className="icon-button" type="button" aria-label={`${post.title} düzenle`} disabled={busy} onClick={() => startEdit(post.id)}><Pencil size={16} /></button><button className="icon-button" type="button" aria-label={`${post.title} sil`} disabled={busy} onClick={() => setDeleting(post.id)}><Trash2 size={16} /></button></>}</div>
      </li>)}</ul>}
    </section>
  </div>
}
