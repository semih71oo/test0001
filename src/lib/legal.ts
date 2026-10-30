export type LegalBlock = string | { list: string[] }
export type LegalSection = { title: string; blocks: LegalBlock[] }
export type LegalDoc = {
  slug: string
  path: string
  title: string
  eyebrow: string
  updated: string
  description: string
  sections: LegalSection[]
}

const EMAIL = '71.semih.algan@gmail.com'
const SITE = 'semihalgan.com.tr'
const UPDATED = '28 Ekim 2026'

export const legalLinks = [
  { path: '/kunye', label: 'Künye' },
  { path: '/kvkk', label: 'KVKK Aydınlatma Metni' },
  { path: '/gizlilik', label: 'Gizlilik ve Çerez Politikası' },
  { path: '/kullanim-kosullari', label: 'Kullanım Koşulları' },
  { path: '/uyelik-sozlesmesi', label: 'Üyelik Sözleşmesi' },
]

const kvkk: LegalDoc = {
  slug: 'kvkk',
  path: '/kvkk',
  title: 'KVKK Aydınlatma Metni',
  eyebrow: 'KİŞİSEL VERİLERİN KORUNMASI',
  updated: UPDATED,
  description: 'Semih Algan web sitesi için 6698 sayılı KVKK kapsamında aydınlatma metni.',
  sections: [
    {
      title: '1. Veri sorumlusu',
      blocks: [
        `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi uyarınca, ${SITE} adresindeki web sitesini işleten Semih Algan (“Veri Sorumlusu”) tarafından hazırlanmıştır.`,
        `İletişim: ${EMAIL}`,
      ],
    },
    {
      title: '2. İşlenen kişisel veriler',
      blocks: [
        { list: [
          'Kimlik ve hesap bilgileri: kullanıcı adı, hesap durumu, hesap oluşturma tarihi.',
          'İletişim bilgisi: yönetici tarafından davet sırasında kaydedilen e-posta adresi.',
          'Doğrulama bilgileri: şifre (yalnızca geri döndürülemez özet olarak), aktivasyon kodu ve şifre sıfırlama kodu (yalnızca özet olarak), oturum belirteci (yalnızca özet olarak).',
          'İşlem güvenliği bilgileri: IP adresi, giriş ve işlem denemeleri, oturum süresi.',
          'Kullanıcı içeriği: yazılara yaptığınız yorumlar, beğeniler ve yorum kısıtlaması gibi moderasyon kayıtları.',
          'Doğrudan e-posta veya telefonla iletişime geçmeniz halinde, bu iletişimde paylaştığınız bilgiler.',
        ] },
      ],
    },
    {
      title: '3. İşleme amaçları',
      blocks: [
        { list: [
          'Üyelik hesabının oluşturulması, doğrulanması ve yönetilmesi.',
          'Giriş yapılması, oturumun sürdürülmesi ve şifre sıfırlama e-postasının gönderilmesi.',
          'Yorum ve beğeni özelliklerinin sunulması, kötüye kullanımın ve spam’in önlenmesi.',
          'Site ve hesap güvenliğinin sağlanması, hız sınırlaması ve yetkisiz erişimin engellenmesi.',
          'Bize ilettiğiniz taleplerin yanıtlanması.',
          'Hukuki yükümlülüklerin yerine getirilmesi.',
        ] },
      ],
    },
    {
      title: '4. Hukuki sebepler',
      blocks: [
        'Kişisel verileriniz KVKK’nın 5. maddesinin 2. fıkrasındaki şu sebeplere dayanılarak işlenir:',
        { list: [
          'Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m. 5/2-c): üyelik hesabı ve üyelik sözleşmesi.',
          'Hukuki yükümlülüğün yerine getirilmesi (m. 5/2-ç): yetkili makamların talepleri, 5651 sayılı Kanun kapsamındaki yükümlülükler.',
          'Veri sorumlusunun meşru menfaati (m. 5/2-f): site güvenliği, kötüye kullanımın önlenmesi, hız sınırlaması.',
        ] },
        'Bu sitede pazarlama, profilleme veya reklam amaçlı veri işleme yapılmaz.',
      ],
    },
    {
      title: '5. Verilerin toplanma yöntemi',
      blocks: [
        'Verileriniz; yönetici tarafından yapılan davet, kayıt ve giriş formları, yorum ve beğeni işlemleri ile tarayıcınızın sunucuya otomatik olarak ilettiği teknik bilgiler (IP adresi, tarayıcı bilgisi) aracılığıyla elektronik ortamda toplanır.',
      ],
    },
    {
      title: '6. Verilerin aktarılması',
      blocks: [
        'Kişisel verileriniz satılmaz ve reklam amacıyla üçüncü kişilerle paylaşılmaz. Sitenin çalışması için aşağıdaki hizmet sağlayıcılar kullanılır:',
        { list: [
          'Cloudflare, Inc.: web sitesinin barındırılması, veritabanı ve ağ güvenliği. Bu hizmet kapsamında verileriniz Cloudflare’in yurt dışındaki sunucularında işlenebilir.',
          'Resend: yalnızca şifre sıfırlama e-postasının iletilmesi. E-posta adresiniz ve e-postanın içeriği Resend’in sunucularına iletilir; bu sunucular yurt dışında bulunabilir.',
        ] },
        'Yazı tipleri (DM Sans ve Manrope) sitemizin kendi sunucusundan yüklenir. Bu nedenle yazı tipi yüklemesi sırasında IP adresiniz Google’a veya başka bir üçüncü kişiye iletilmez.',
        'Yukarıdaki hizmet sağlayıcıların bazı sunucuları yurt dışında bulunduğundan, kişisel verileriniz KVKK’nın 9. maddesi uyarınca yurt dışına aktarılabilir. Bu aktarım; yeterli koruma bulunan ülkelere, ya da KVKK’da öngörülen diğer güvencelere (standart sözleşmeler vb.) dayanılarak yapılır. Bu güvencelerin sağlanamadığı hallerde ise yalnızca açık rızanızla aktarım yapılır. Açık rızanızı kayıt ekranında ayrıca vermenizi isteriz; rızanızı istediğiniz zaman geri alabilirsiniz (bkz. Madde 7A, 8 ve 9).',
        'Ayrıca yasal bir zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla paylaşım yapılabilir.',
      ],
    },
    {
      title: '7. Saklama süreleri',
      blocks: [
        { list: [
          'Oturum çerezi ve oturum kaydı: en fazla 7 gün veya çıkış yapana kadar.',
          'Aktivasyon kodu: en fazla 48 saat ve tek kullanımlık.',
          'Şifre sıfırlama bağlantısı: en fazla 30 dakika ve tek kullanımlık.',
          'Hız sınırlaması kayıtları: kısa süreli, süre dolunca geçersiz olur.',
          'Hesap, yorum ve beğeni verileri: üyeliğiniz sürdüğü veya silme talebinde bulunana kadar.',
          'Yasal saklama yükümlülüğü bulunan veriler: ilgili mevzuatta öngörülen süre kadar.',
        ] },
        'Süre sonunda verileriniz silinir, yok edilir veya anonim hale getirilir.',
      ],
    },
    {
      title: '7A. Açık rıza ve geri alma',
      blocks: [
        'Kişisel verilerinizin yurt dışına aktarılmasının, KVKK’nın 9. maddesinde öngörülen koşulların sağlanamadığı durumlarda, yalnızca açık rızanıza dayanarak yapılmasını öngörüyoruz. Kayıt ve aktivasyon sırasında verdiğiniz açık rıza, ayrıca “Aydınlatma Metni okudum” onayından bağımsızdır.',
        `Açık rızanızı dilediğiniz zaman ${EMAIL} adresine e-posta göndererek geri alabilirsiniz. Geri alma, geri alma tarihinden önce yapılmış işlemleri etkilemez. Rızanızı geri alırsanız, hesabınızın çalışması için gerekli olan aktarımlar (örneğin giriş ve şifre sıfırlama) sınırlanabilir.`,
      ],
    },
    {
      title: '8. KVKK madde 11 kapsamındaki haklarınız',
      blocks: [
        'Veri sorumlusuna başvurarak şu haklarınızı kullanabilirsiniz:',
        { list: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme,',
          'İşlenmişse buna ilişkin bilgi talep etme,',
          'İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
          'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme,',
          'KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,',
          'Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
          'İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme,',
          'Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.',
        ] },
      ],
    },
    {
      title: '9. Başvuru yöntemi',
      blocks: [
        `Taleplerinizi, kimliğinizi doğrulamamıza yardımcı olacak bilgilerle birlikte ${EMAIL} adresine e-posta yoluyla iletebilirsiniz. Başvurular, talebin niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Cevabımızdan memnun kalmamanız halinde Kişisel Verileri Koruma Kurumu’na şikâyet hakkınız saklıdır.`,
      ],
    },
  ],
}

const gizlilik: LegalDoc = {
  slug: 'gizlilik',
  path: '/gizlilik',
  title: 'Gizlilik ve Çerez Politikası',
  eyebrow: 'GİZLİLİK',
  updated: UPDATED,
  description: 'Semih Algan web sitesinin gizlilik ve çerez politikası.',
  sections: [
    {
      title: '1. Genel',
      blocks: [
        `Bu politika, ${SITE} sitesini kullanırken hangi bilgilerin toplandığını, nasıl kullanıldığını ve nasıl korunduğunu açıklar. Kişisel verilerin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni’nde yer alır.`,
      ],
    },
    {
      title: '2. Topladığımız bilgiler',
      blocks: [
        { list: [
          'Hesap bilgileri: kullanıcı adı ve e-posta adresi.',
          'Şifreniz düz metin olarak saklanmaz; yalnızca geri döndürülemez özet olarak tutulur ve yöneticiler dahil kimse tarafından görüntülenemez.',
          'Yorumlarınız ve beğenileriniz.',
          'Güvenlik amacıyla IP adresi. Misafir beğenilerinde ve IP yasaklarında IP adresi doğrudan değil, özeti alınarak kullanılır.',
        ] },
        'Reklam, takip veya kullanıcı profilleme amacıyla bilgi toplamıyoruz. Üçüncü taraf analiz veya reklam araçları kullanmıyoruz.',
      ],
    },
    {
      title: '3. Bilgilerin kullanımı',
      blocks: [
        'Bilgileriniz yalnızca hesabınızı yönetmek, giriş yapmanızı sağlamak, şifre sıfırlama e-postası göndermek, yorum ve beğeni özelliklerini sunmak ve siteyi kötüye kullanıma karşı korumak için kullanılır.',
      ],
    },
    {
      title: '4. Çerezler',
      blocks: [
        'Çerez, ziyaret ettiğiniz sitenin tarayıcınıza kaydettiği küçük bir metin dosyasıdır. Sitemiz şu çerezleri kullanır:',
        { list: [
          'Zorunlu Çerezler (sa_session): Giriş yaptığınızda oluşturulur, oturumunuzu tanımak için kullanılır. Analiz veya pazarlama amacıyla kullanılmaz. Çıkış yaptığınızda veya süresi dolduğunda (en fazla 7 gün) silinir.',
        ] },
        'Çerez tercihlerinizi sitemize ilk girişinizde karşınıza çıkan onay ekranından yönetebilirsiniz. Tarayıcı ayarlarınızdan çerezleri tamamen silebilir veya engelleyebilirsiniz; ancak bu durumda giriş yapamazsınız.',
      ],
    },
    {
      title: '5. Üçüncü taraf hizmetler',
      blocks: [
        { list: [
          'Cloudflare: sitenin barındırılması, veritabanı ve ağ güvenliği.',
          'Resend: şifre sıfırlama e-postasının gönderilmesi.',
        ] },
        'Manrope ve DM Sans yazı tipleri sitemizin kendi sunucusundan yüklenir; Google’a bağlantı kurulmaz. Üçüncü taraf analiz veya reklam araçları kullanmıyoruz.',
      ],
    },
    {
      title: '6. Güvenlik',
      blocks: [
        'Şifreler tuzlu ve yavaşlatılmış bir yöntemle özetlenir. Aktivasyon kodları, sıfırlama kodları ve oturum belirteçleri yalnızca özet halinde saklanır. Bağlantı HTTPS ile şifrelenir. Giriş ve doğrulama denemeleri sınırlandırılır. Hiçbir sistemin tamamen risksiz olmadığını hatırlatırız.',
      ],
    },
    {
      title: '7. Haklarınız ve iletişim',
      blocks: [
        `Verilerinize erişme, düzeltme veya silme taleplerinizi ${EMAIL} adresine iletebilirsiniz. Ayrıntılar için KVKK Aydınlatma Metni’ne bakınız.`,
      ],
    },
    {
      title: '8. Değişiklikler',
      blocks: [
        'Bu politika zaman zaman güncellenebilir. Güncel sürüm bu sayfada yayımlanır ve sayfanın üstündeki tarih değiştirilir.',
      ],
    },
  ],
}

const kosullar: LegalDoc = {
  slug: 'kullanim-kosullari',
  path: '/kullanim-kosullari',
  title: 'Kullanım Koşulları',
  eyebrow: 'KULLANIM KOŞULLARI',
  updated: UPDATED,
  description: 'Semih Algan web sitesinin kullanım koşulları.',
  sections: [
    {
      title: '1. Kabul',
      blocks: [
        `${SITE} sitesini (“Site”) ziyaret ederek veya kullanarak bu koşulları kabul etmiş olursunuz. Koşulları kabul etmiyorsanız Siteyi kullanmayınız.`,
      ],
    },
    {
      title: '2. Sitenin niteliği',
      blocks: [
        'Site, Semih Algan’ın kişisel yazılım vitrini ve tanıtım sitesidir. Sitede ürün satışı, ödeme veya ticari işlem yapılmaz. Yazılımlar ve duyurular bilgi amaçlıdır; “yakında” olarak belirtilen içeriklerin yayın tarihi veya kapsamı konusunda taahhüt verilmez.',
      ],
    },
    {
      title: '3. Fikri mülkiyet',
      blocks: [
        'Sitedeki tasarım, metin, logo, yazı ve kaynak kodu üzerindeki haklar aksi belirtilmedikçe Semih Algan’a aittir. Önceden yazılı izin alınmadan kopyalanamaz, çoğaltılamaz, dağıtılamaz veya ticari amaçla kullanılamaz. Kısa alıntılar, kaynak göstermek şartıyla serbesttir.',
      ],
    },
    {
      title: '4. Kullanıcı davranışları',
      blocks: [
        'Siteyi kullanırken şunları yapmayacağınızı kabul edersiniz:',
        { list: [
          'Hukuka, genel ahlaka veya üçüncü kişilerin haklarına aykırı davranmak,',
          'Hakaret, tehdit, nefret söylemi, taciz veya spam içerik paylaşmak,',
          'Başkasının hesabına yetkisiz erişmeye çalışmak veya hesabınızı devretmek,',
          'Siteye zarar verecek yazılım, otomatik tarama veya yoğun istek göndermek, güvenlik önlemlerini aşmaya çalışmak,',
          'Sitede bulunan açıkları kötüye kullanmak.',
        ] },
      ],
    },
    {
      title: '5. Kullanıcı içerikleri',
      blocks: [
        'Yaptığınız yorumlardan siz sorumlusunuz. Yorum yaparak, içeriğinizin Sitede yayımlanması için gerekli sınırlı kullanım izni vermiş olursunuz. Kurallara aykırı içerikler önceden bildirim yapılmaksızın kaldırılabilir; ihlal halinde yorum yapma yetkiniz geçici veya kalıcı olarak kısıtlanabilir.',
      ],
    },
    {
      title: '6. Sorumluluğun sınırlandırılması',
      blocks: [
        'Site “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışacağı garanti edilmez; bakım, güncelleme veya teknik nedenlerle erişim geçici olarak durdurulabilir. Yasaların izin verdiği ölçüde, Sitenin kullanımından veya kullanılamamasından doğan dolaylı zararlardan sorumluluk kabul edilmez. Üçüncü taraf sitelere verilen bağlantıların içeriğinden sorumlu değiliz.',
      ],
    },
    {
      title: '7. Değişiklikler',
      blocks: [
        'Bu koşullar önceden duyuru yapılmaksızın güncellenebilir. Güncel sürüm bu sayfada yayımlanır; Siteyi kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.',
      ],
    },
    {
      title: '8. Uygulanacak hukuk ve yetki',
      blocks: [
        'Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda, tüketici mevzuatından doğan yetki kuralları saklı kalmak kaydıyla Türkiye mahkemeleri ve icra daireleri yetkilidir.',
      ],
    },
    {
      title: '9. İletişim',
      blocks: [`Sorularınız için: ${EMAIL}`],
    },
  ],
}

const uyelik: LegalDoc = {
  slug: 'uyelik-sozlesmesi',
  path: '/uyelik-sozlesmesi',
  title: 'Kullanıcı / Üyelik Sözleşmesi',
  eyebrow: 'ÜYELİK SÖZLEŞMESİ',
  updated: UPDATED,
  description: 'Semih Algan web sitesi kullanıcı ve üyelik sözleşmesi.',
  sections: [
    {
      title: '1. Taraflar',
      blocks: [
        `Bu sözleşme, ${SITE} sitesini işleten Semih Algan (“Site Sahibi”) ile Siteye üye olan kişi (“Üye”) arasında, Üyenin kayıt sırasında sözleşmeyi onaylamasıyla elektronik ortamda kurulur.`,
      ],
    },
    {
      title: '2. Konu',
      blocks: [
        'Sözleşmenin konusu, Üyenin Site üzerindeki üyelik hesabını kullanmasına, yazılara yorum yapmasına ve beğeni bırakmasına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.',
      ],
    },
    {
      title: '3. Üyelik ve aktivasyon',
      blocks: [
        { list: [
          'Üyelik yalnızca Site Sahibinin davetiyle oluşturulur. Davet sırasında kullanıcı adınız ve e-posta adresiniz kaydedilir.',
          'Size iletilen 16 haneli aktivasyon kodu tek kullanımlıktır ve 48 saat geçerlidir. Kodu başkasıyla paylaşmamalısınız.',
          'Aktivasyon sırasında en az 12 karakterlik bir şifre belirlersiniz.',
          'Üyelik ücretsizdir. Site Sahibi, üyelik talebini gerekçe göstermeksizin reddedebilir.',
          'Üye, kayıt bilgilerinin doğru olduğunu ve 18 yaşını doldurduğunu veya yasal temsilcisinin onayını aldığını beyan eder.',
        ] },
      ],
    },
    {
      title: '4. Üyenin yükümlülükleri',
      blocks: [
        { list: [
          'Şifrenizi ve hesabınızın güvenliğini korumak sizin sorumluluğunuzdadır; hesabınızla yapılan işlemlerden siz sorumlusunuz.',
          'Hesabınızın izinsiz kullanıldığından şüphelenirseniz derhal Site Sahibine bildirmelisiniz.',
          'Hesabınızı başkasına devredemez veya paylaşamazsınız.',
          'Kullanım Koşulları’na, yürürlükteki mevzuata ve genel ahlaka uygun davranmalısınız.',
          'Hakaret, tehdit, spam, yanıltıcı veya hukuka aykırı içerik paylaşmamalısınız.',
        ] },
      ],
    },
    {
      title: '5. Site Sahibinin hak ve yükümlülükleri',
      blocks: [
        { list: [
          'Kişisel verileriniz KVKK Aydınlatma Metni ve Gizlilik ve Çerez Politikası’na uygun işlenir.',
          'Kurallara aykırı içerikleri kaldırabilir, yorum yapma yetkinizi geçici veya kalıcı olarak kısıtlayabilir, hesabınızı askıya alabilir veya sonlandırabilir.',
          'Siteyi ve üyelik özelliklerini bakım, güvenlik veya teknik nedenlerle geçici olarak kapatabilir, özellikleri değiştirebilir veya kaldırabilir.',
          'Üyelik özelliği ücretsizdir; Site Sahibi hizmetin kesintisiz veya hatasız olacağını garanti etmez.',
        ] },
      ],
    },
    {
      title: '6. Kullanıcı içerikleri',
      blocks: [
        'Yorumlarınızın hukuki sorumluluğu size aittir. Yorum yaparak, içeriğinizin Sitede yayımlanması ve moderasyonu için gerekli sınırlı, münhasır olmayan kullanım izni verirsiniz. İçeriğinizi silme talebiniz KVKK Aydınlatma Metni’ndeki yöntemle iletilebilir.',
      ],
    },
    {
      title: '7. Süre ve fesih',
      blocks: [
        'Sözleşme, süresiz olarak yürürlüğe girer. Üye, hesabının kapatılmasını istediğini e-posta ile bildirerek dilediği zaman sözleşmeyi feshedebilir. Site Sahibi, sözleşmenin ihlali halinde hesabı derhal askıya alabilir veya sonlandırabilir. Fesih halinde, yasal saklama yükümlülüğü olan veriler hariç, hesap verileriniz makul süre içinde silinir veya anonim hale getirilir.',
      ],
    },
    {
      title: '8. Değişiklikler',
      blocks: [
        'Site Sahibi sözleşmeyi güncelleyebilir. Esaslı değişiklikler Sitede duyurulur. Değişiklikleri kabul etmiyorsanız üyeliğinizi sonlandırabilirsiniz.',
      ],
    },
    {
      title: '9. Uygulanacak hukuk ve yetki',
      blocks: [
        'Bu sözleşmeye Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda, tüketici mevzuatından doğan yetki kuralları saklı kalmak kaydıyla Türkiye mahkemeleri ve icra daireleri yetkilidir.',
      ],
    },
    {
      title: '10. Yürürlük',
      blocks: [
        'Üye, kayıt sırasında ilgili onay kutusunu işaretleyerek bu sözleşmenin tamamını okuduğunu, anladığını ve kabul ettiğini beyan eder. Sözleşme, onayın verildiği anda yürürlüğe girer.',
      ],
    },
  ],
}

const kunye: LegalDoc = {
  slug: 'kunye',
  path: '/kunye',
  title: 'Künye',
  eyebrow: 'SİTE SAHİBİ BİLGİLERİ',
  updated: UPDATED,
  description: 'Semih Algan web sitesinin künye ve iletişim bilgileri.',
  sections: [
    {
      title: '1. Site sahibi ve sorumlusu',
      blocks: [
        { list: [
          'Ad Soyad: Semih Algan',
          `Alan adı: ${SITE}`,
          `E-posta: ${EMAIL}`,
        ] },
        'Site sahibi, bu sitenin içerik sağlayıcısı ve yer sağlayıcısıdır.',
      ],
    },
    {
      title: '2. Barındırma ve altyapı',
      blocks: [
        'Web sitesi, Cloudflare, Inc. altyapısı üzerinde barındırılmaktadır. Şifre sıfırlama e-postaları Resend aracılığıyla iletilir.',
      ],
    },
    {
      title: '3. İçerik bildirimleri',
      blocks: [
        `Sitede yer alan yazı veya yorumlarla ilgili hak ihlali, şikâyet ve kaldırma talepleriniz için ${EMAIL} adresine e-posta gönderebilirsiniz. Başvurular makul süre içinde değerlendirilir.`,
      ],
    },
    {
      title: '4. Kişisel veriler',
      blocks: [
        'Kişisel verilerin işlenmesine ilişkin ayrıntılı bilgi için KVKK Aydınlatma Metni ve Gizlilik ve Çerez Politikası sayfalarına bakabilirsiniz.',
      ],
    },
  ],
}

export const legalDocs: Record<string, LegalDoc> = {
  kunye,
  kvkk,
  gizlilik,
  'kullanim-kosullari': kosullar,
  'uyelik-sozlesmesi': uyelik,
      }
