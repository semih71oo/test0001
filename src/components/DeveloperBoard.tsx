import { useEffect, useState } from 'react'
import { ArrowUpRight, Code2, Crown, Palette, Shield, Users } from 'lucide-react'
import { communityApi, developerRoles } from '../lib/community'
import type { Developer, DeveloperRole } from '../lib/community'

const roleIcons = { Kurucu: Crown, Admin: Shield, Moderatör: Shield, Developer: Code2, Tasarımcı: Palette }

export function RoleBadge({ role }: { role: DeveloperRole }) {
  const Icon = roleIcons[role]
  return <span className={`role-badge role-${developerRoles.indexOf(role)}`}><Icon size={13} />{role}</span>
}

export function DeveloperCards({ developers }: { developers: Developer[] }) {
  if (!developers.length) return <div className="board-empty"><Users size={27} /><h3>Yeni bir ekip için yer var.</h3><p>Henüz geliştirici eklenmedi. Yönetici eklediğinde isimler ve roller burada görünecek.</p></div>
  return <div className="developer-grid">{[...developers].sort((first, second) => developerRoles.indexOf(first.role) - developerRoles.indexOf(second.role)).map(developer => <article className="developer-card" key={developer.id}><div className="developer-monogram" aria-hidden="true">{developer.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('tr-TR')}</div><RoleBadge role={developer.role} /><h3>{developer.name}</h3><span className="developer-card-label">GELİŞTİRİCİ PANOSU</span></article>)}</div>
}

export function DeveloperBoard() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  function load() {
    setState('loading')
    communityApi<Developer[]>('developers').then(data => { setDevelopers(data); setState('ready') }).catch(() => setState('error'))
  }

  useEffect(load, [])

  return <section className="container section-space community-section" id="pano" aria-labelledby="board-title"><div className="section-heading"><div><span className="section-eyebrow">BİRLİKTE DAHA İLERİ</span><h2 id="board-title">Geliştiriciler<span className="heading-dot">.</span></h2></div><a className="board-link" href="/giris">Panele giriş <ArrowUpRight size={17} /></a></div><p className="board-description">Fikirlerin arkasındaki isimler. Her rol, aynı panoda.</p><div aria-live="polite" aria-busy={state === 'loading'}>{state === 'loading' ? <div className="developer-grid board-skeleton" aria-label="Geliştiriciler yükleniyor">{[1, 2, 3].map(item => <div className="skeleton-card" key={item}><span /><span /><span /></div>)}</div> : state === 'error' ? <div className="board-empty"><Users size={27} /><h3>Pano şu an yüklenemiyor.</h3><p>Bağlantıyı kontrol edip tekrar deneyebilirsin.</p><button className="button button-outline" type="button" onClick={load}>Tekrar dene</button></div> : <DeveloperCards developers={developers} />}</div></section>
}
