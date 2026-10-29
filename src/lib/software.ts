// Yeni yazılım eklemek için aşağıdaki listeye bir kayıt daha ekle. Vitrin sayfası otomatik güncellenir.
export type Software = {
  slug: string
  title: string
  description: string
  tags: string[]
  href: string
  status: 'Yayında' | 'Yakında'
}

export const softwareList: Software[] = [
  {
    slug: 'not',
    title: 'Tek Kullanımlık Not',
    description: 'Notunu tarayıcında şifrele, tek kullanımlık ya da süreli bir link oluştur. Okunan not sunucudan silinir.',
    tags: ['Şifreli', 'Hesap gerekmez', 'Ücretsiz'],
    href: '/yazilimlar/not',
    status: 'Yayında',
  },
  {
    slug: 'link',
    title: 'URL Kısaltıcı & Analitik',
    description: 'Uzun linkleri anında kısalt, QR kod oluştur ve tıklayanların ülke ile cihaz istatistiklerini canlı takip et.',
    tags: ['Hızlı Yönlendirme', 'İstatistik', 'QR Kod'],
    href: 'https://link.semihalgan.com.tr', // Subdomain'i farklı yaptıysan (örn: l.semihalgan.com.tr) burayı ona göre yaz
    status: 'Yayında',
  },
]
