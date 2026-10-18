import { useEffect, useState } from 'react'
import { Code2, Crown, Palette, Shield, Users } from 'lucide-react'
import { communityApi, developerRoles } from '../lib/community'
import type { Developer, DeveloperRole } from '../lib/community'

const roleIcons = { Kurucu: Crown, Admin: Shield, Moderatör: Shield, Developer: Code2, Tasarımcı: Palette }

export function RoleBadge({ role }: { role: DeveloperRole }) {
  const Icon = roleIcons[role] ?? Code2
  const index = Math.max(developerRoles.indexOf(role), 0)
  return <span className={`role-badge role-${index}`}><Icon size={13} />{role}</span>
}

const roleDescriptions: Record<DeveloperRole, string> = {
  Kurucu: 'Projeyi başlatan ve yönünü belirleyen kişi.',
  Admin: 'Siteyi ve hesapları yöneten ekip üyesi.',
  Moderatör: 'Topluluğu ve içeriği düzenli tutar.',
  Developer: 'Fikirleri çalışan koda dönüştürür.',
  Tasarımcı: 'Arayüzü ve görünümü şekillendirir.',
}

const roleRank = (role: DeveloperRole) => {
  const index = developerRoles.indexOf(role)
  return index === -1 ? developerRoles.length : index
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('tr-TR') || '?'

export function DeveloperCards({ developers }: { developers: Developer[] }) {
  if (!developers.length) return <div className="board-empty"><Users size={27} /><h3>Yeni bir ekip için yer var.</h3><p>Henüz geliştirici eklenmedi. Yönetici eklediğinde isimler ve roller burada görünecek.</p></div>
  return <div className="developer-grid">{[...developers].sort((first, second) => roleRank(first.role) - roleRank(second.role)).map(developer => <article className="developer-card" key={developer.id} style={{ minHeight: 0 }}><div className="developer-monogram" aria-hidden="true">{initials(developer.name)}</div><RoleBadge role={developer.role} /><h3>{developer.name}</h3><p style={{ margin: '8px 0 0', fontSize: '.95rem', lineHeight: 1.5, opacity: .7 }}>{roleDescriptions[developer.role] ?? ''}</p></article>)}</div>
}

export function DeveloperBoard() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setState('loading')
    communityApi<Developer[]>('developers')
      .then(data => { if (active) { setDevelopers(data); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [reloadKey])

  return <section className="container section-space community-section" id="pano" aria-labelledby="board-title"><div className="section-heading"><div><span className="section-eyebrow">BİRLİKTE DAHA İLERİ</span><h2 id="board-title">Geliştiriciler<span className="heading-dot">.</span></h2></div></div><p className="board-description">Fikirlerin arkasındaki isimler. Her rol, aynı panoda.</p><div aria-live="polite" aria-busy={state === 'loading'}>{state === 'loading' ? <div className="developer-grid board-skeleton" aria-label="Geliştiriciler yükleniyor">{[1, 2, 3].map(item => <div className="skeleton-card" key={item}><span /><span /><span /></div>)}</div> : state === 'error' ? <div className="board-empty"><Users size={27} /><h3>Pano şu an yüklenemiyor.</h3><p>Bağlantıyı kontrol edip tekrar deneyebilirsin.</p><button className="button button-outline" type="button" onClick={() => setReloadKey(key => key + 1)}>Tekrar dene</button></div> : <DeveloperCards developers={developers} />}</div></section>
}
