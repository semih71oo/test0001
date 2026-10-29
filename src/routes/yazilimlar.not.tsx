import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
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

function NotPage() {
  return (
    <PublicShell>
      <section className="container section-space">
        <div className="eyebrow section-eyebrow">01 / YAZILIMLAR</div>
        <h1>Tek Kullanımlık Not</h1>
        <p>
          Notunuzu tarayıcınızda şifreleyip tek kullanımlık bir link oluşturun. Sunucu notun içeriğini okuyamaz.
          Not, "okunduktan hemen sonra" ya da seçtiğiniz süre dolunca kalıcı olarak silinir.
        </p>
        <ul>
          <li>Hesap ya da kayıt gerektirmez</li>
          <li>Metin tarayıcıda AES-GCM ile şifrelenir</li>
          <li>Okunan not sunucudan silinir</li>
        </ul>
        <a
          className="button button-primary"
          href="https://notlar.semihalgan.com.tr"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aracı aç <ArrowUpRight size={19} />
        </a>
      </section>
    </PublicShell>
  )
}
