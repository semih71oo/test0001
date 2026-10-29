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
]
