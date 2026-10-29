import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Lock, Timer, UserX } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'

export const Route = createFileRoute('/yazilimlar/not')({
  component: NotPage,
  head: () => ({
    meta: [
      { title: 'Tek Kullanımlık Not — Semih Algan' },
      { name: 'description', content: 'Şifreli, tek kullanımlık ya da süreli not paylaşım aracı.' },
    ],
  }),
})

const features = [
  { icon: Lock, title: 'Tarayıcıda şifrelenir', text: 'Not AES-GCM ile tarayıcında şifrelenir. Sunucu içeriği okuyamaz.' },
  { icon: Timer, title: 'Süre dolunca silinir', text: 'Okunduktan hemen sonra, 1 saat sonra ya da 1 gün sonra yok olur.' },
  { icon: UserX, title: 'Hesap gerekmez', text: 'Kayıt olmadan kullanabilirsin. Çerez kullanılmaz.' },
]

function NotPage() {
  return (
    <PublicShell>
      <a href="/yazilimlar" style={{ display: 'inline-block', marginBottom: 16, opacity: 0.7, textDecoration: 'none', color: 'inherit' }}>
        ← Tüm yazılımlar
      </a>
      <span className="section-eyebrow" style={{ display: 'block' }}>YAZILIMLAR</span>
      <h1 style={{ margin: '8px 0 12px' }}>Tek Kullanımlık Not<span className="heading-dot">.</span></h1>
      <p style={{ margin: '0 0 28px', opacity: 0.75, lineHeight: 1.6 }}>
        Notunu yaz, tek kullanımlık bir link oluştur ve sadece göndermek istediğin kişiyle paylaş.
      </p>

      <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
        {features.map(f => (
          <div key={f.title} className="panel-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <f.icon size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{f.title}</h2>
              <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.55 }}>{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <a
        className="button button-primary"
        href="https://notlar.semihalgan.com.tr"
        target="_blank"
        rel="noopener noreferrer"
      >
        Aracı aç <ArrowUpRight size={19} />
      </a>
    </PublicShell>
  )
}
