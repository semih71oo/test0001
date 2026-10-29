/**
 * ⚠️ AI & GELİŞTİRİCİ ZORUNLU MİMARİ KURALI:
 * 1. Sitedeki HER YAZILIMIN ana sitede MUTLAKA `/yazilimlar/[ismi]` formatında bir detay sayfası olmalıdır.
 *    - Örnek: /yazilimlar/not veya /yazilimlar/link
 * 2. Kartların yönlendirme adresi (href) doğrudan harici subdomain'e DEĞİL, 
 *    her zaman bu iç detay sayfasına (`/yazilimlar/[ismi]`) gitmelidir.
 * 3. Harici araca çıkış linki, sadece bu detay sayfası içindeki "Aracı Aç ↗" butonunda yer alır.
 */

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
    href: '/yazilimlar/link',
    status: 'Yayında',
  },
]
