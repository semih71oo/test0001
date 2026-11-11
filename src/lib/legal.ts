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
const UPDATED = '11 Kasım 2026'

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
          'Doğrulama bilgileri: şifre özeti, aktivasyon ve şifre sıfırlama kodlarının özetleri, oturum belirtecinin özeti; yönetici hesaplarında iki faktörlü doğrulama için kullanılan kimlik doğrulama sırrı ve son doğrulama kodu.',
          'İşlem güvenliği bilgileri: IP adresi ve IP adresinden türetilen özetler, giriş/işlem denemeleri, hız sınırlaması kayıtları, oturum bilgileri ve güvenlik amacıyla tutulan yasaklama kayıtları.',
          'Kullanıcı içeriği: yazılara eklediğiniz yorumlar, beğeniler, yorumların önceki sürümleri (yorum düzenleme geçmişi) ve moderasyon kayıtları.',
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
          'Site ve hesap güvenliğinin sağlanması, iki faktörlü doğrulama, hız sınırlaması, kötüye kullanımın tespiti ve yetkisiz erişimin engellenmesi.',
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
          'Hukuki yükümlülüğün yerine getirilmesi (m. 5/2-ç): somut olayda veri sorumlusuna uygulanabilen mevzuat yükümlülükleri ve yetkili makamların hukuka uygun talepleri.',
          'Bir hakkın tesisi, kullanılması veya korunması (m. 5/2-e): gerekli hâllerde uyuşmazlık ve ihlal kayıtlarının değerlendirilmesi. Veri sorumlusunun meşru menfaati (m. 5/2-f): site güvenliği, kötüye kullanımın önlenmesi ve hız sınırlaması; temel hak ve özgürlüklerinize zarar vermemek kaydıyla.',
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
        'Cloudflare ve Resend hizmetlerinin kullanımı, kişisel verilerin yurt dışındaki sistemlere aktarılmasını veya bu sistemlerden erişilmesini gerektirebilir. Böyle bir aktarım, yalnızca aktarım tarihinde KVKK’nın 9. maddesinde öngörülen geçerli aktarım şartlarından biri ve gerekli güvenceler sağlanmışsa gerçekleştirilir. Uygunluk kararı, uygun güvence (ör. usulüne uygun standart sözleşme) veya kanundaki sınırlı arızi aktarım şartları somut hizmet ve aktarım bakımından ayrıca değerlendirilmelidir. Bu metin, tek başına belirli bir ülke için yeterlilik kararı bulunduğunu ya da standart sözleşme imzalandığını beyan etmez. Aktarımın hukuki dayanağı ve ilgili alıcı kategorileri hakkında bilgi talep edebilirsiniz.',
        'Ayrıca yasal bir zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla paylaşım yapılabilir.',
      ],
    },
    {
      title: '7. Saklama süreleri',
      blocks: [
        { list: [
          'Oturum çerezi ve oturum kaydı: oturum çerezi en fazla 7 gün geçerlidir; oturum kaydı süresi dolduğunda veya çıkış yapıldığında temizlenir.',
          'Aktivasyon kodu: kullanılmadığında en fazla 48 saat; kullanılmış kodun kaydı en fazla 7 gün sonra temizlenir.',
          'Şifre sıfırlama bağlantısı: en fazla 30 dakika ve tek kullanımlık.',
          'Hız sınırlaması kayıtları: ilgili deneme penceresi sona erdiğinde temizlenir.',
          'Hesap, yorum ve beğeni verileri: üyelik sürdüğü ve ilgili hizmet amaçları devam ettiği sürece; hesap kapatma veya silme talepleri, yasal yükümlülükler ve üçüncü kişilerin hakları dikkate alınarak değerlendirilir. Yorum düzenleme geçmişi ve moderasyon/yasaklama kayıtları, güvenlik veya olası uyuşmazlık için gerekli oldukları süreyle sınırlı tutulur ve gereklilikleri düzenli olarak gözden geçirilmelidir.',
          'Yasal saklama veya bir hakkın tesisi, kullanılması ya da korunması için tutulması gereken kayıtlar: ilgili yükümlülük veya ihtiyacın devam ettiği süre kadar.',
        ] },
        'Saklama amacı sona erdiğinde ve başka bir hukuki saklama sebebi bulunmadığında veriler silinir, yok edilir veya anonim hâle getirilir. Yorum geçmişi ve moderasyon kayıtları için uygulanan süreler ayrıca belirlenmeli ve bu metinle uyumlu biçimde işletilmelidir.',
      ],
    },
    {
      title: '7A. Yurt dışına aktarım ve açık rıza',
      blocks: [
        'Açık rıza, sürekli veya olağan yurt dışı veri aktarımının genel ve otomatik hukuki dayanağı olarak kullanılmaz. KVKK’nın 9. maddesindeki aktarım şartları ve güvenceler sağlanmalıdır. Açık rıza ancak kanunda öngörülen istisnai aktarım şartlarının somut olayda mevcut olması hâlinde, belirli aktarım için ayrı, bilgilendirilmiş ve özgür iradeye dayalı şekilde alınabilir. Aydınlatma yapılması, açık rıza alınmasıyla aynı işlem değildir; aydınlatma metnini okuduğunuza dair onay vermeniz, veri işlemenin hukuki sebebi olarak açık rıza verdiğiniz anlamına gelmez.',
        `Somut bir işlem için açık rıza alınması gereken istisnai bir durum oluşursa, aktarımın amacı, alıcısı, kapsamı ve rızayı geri alma yöntemi ayrıca açıklanır. Böyle bir rıza, ${EMAIL} adresine başvurarak geri alınabilir; geri alma, geri alma öncesinde hukuka uygun şekilde gerçekleştirilmiş işlemleri geriye dönük olarak geçersiz kılmaz.`,
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
          'Yönetici hesaplarında iki faktörlü doğrulama için kullanılan kimlik doğrulama sırrı ve son doğrulama kodu güvenlik amacıyla işlenir.',
          'Yorumlarınız, yorum düzenleme geçmişiniz ve beğenileriniz.',
          'Güvenlik amacıyla IP adresi ve bundan türetilen özetler; bazı hız sınırlaması kayıtlarında IP adresi doğrudan anahtarın parçası olarak kullanılabilir.',
        ] },
        'Reklam, takip veya kullanıcı profilleme amacıyla bilgi toplamıyoruz. Üçüncü taraf analiz veya reklam araçları kullanmıyoruz.',
      ],
    },
    {
      title: '3. Bilgilerin kullanımı',
      blocks: [
        'Bilgileriniz hesabınızı yönetmek, giriş ve iki faktörlü doğrulamayı sağlamak, şifre sıfırlama e-postası göndermek, yorum ve beğeni özelliklerini sunmak, moderasyonu yürütmek ve siteyi kötüye kullanıma karşı korumak için kullanılır.',
      ],
    },
    {
      title: '4. Çerezler',
      blocks: [
        'Çerez, ziyaret ettiğiniz sitenin tarayıcınıza kaydettiği küçük bir metin dosyasıdır. Uygulama kodunda görülen birinci taraf oturum çerezi şudur:',
        { list: [
          'Zorunlu oturum çerezi (sa_session): Başarılı girişte oluşturulur; HttpOnly, Secure ve SameSite=Lax nitelikleriyle gönderilir. Oturum belirtecini tanımak için kullanılır, uygulama tarafından analiz veya pazarlama amacıyla kullanılmaz ve en fazla 7 gün geçerlidir. Çıkışta geçersiz kılınır.',
        ] },
        'Sitedeki bilgilendirme penceresi bir çerez izni toplamaz; yalnızca bilgilendirme mesajının kapatıldığını tarayıcının yerel depolama alanında hatırlayabilir. Bu kayıt bir çerez değildir ve isteğe bağlı izleme çerezleri için tercih yönetimi anlamına gelmez. Tarayıcı ayarlarınızdan zorunlu oturum çerezini engellerseniz giriş ve oturum özellikleri çalışmayabilir.',
      ],
    },
    {
      title: '5. Üçüncü taraf hizmetler',
      blocks: [
        { list: [
          'Cloudflare: sitenin barındırılması, D1 veritabanı, ağ güvenliği ve isteklerin iletilmesi. Hizmetin yapılandırmasına bağlı olarak teknik bağlantı verileri işlenebilir.',
          'Resend: şifre sıfırlama e-postalarının iletilmesi; bu işlem için alıcının e-posta adresi ve e-posta içeriği hizmete aktarılır.',
        ] },
        'Manrope ve DM Sans yazı tipleri sitemizin kendi sunucusundan yüklenir. Uygulama kodunda üçüncü taraf analiz veya reklam aracı tespit edilmemiştir; Cloudflare güvenlik yapılandırmasının oluşturabileceği teknik çerezler ve canlı ortamda etkinleştirilmiş diğer hizmetler ayrıca kontrol edilmelidir.',
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
        'Yorumların fikrî hakları ve hukuki sorumluluğu, yürürlükteki mevzuatın izin verdiği ölçüde içeriği oluşturan kullanıcıya aittir. Yorum göndererek, Site sahibine yorumu Sitede barındırmak, görüntülemek, teknik olarak çoğaltmak, yedeklemek ve moderasyon/güvenlik amacıyla incelemek için gerekli, münhasır olmayan, bedelsiz ve yalnızca bu hizmetin sunulmasıyla sınırlı bir kullanım izni verirsiniz. Bu izin, yorumun mülkiyetini Site sahibine devretmez. Hukuka veya bu koşullara aykırı içerik kaldırılabilir; kullanıcı, kaldırma veya kısıtlama kararına ilişkin gerekçeli inceleme talebini iletişim adresine iletebilir.',
      ],
    },
    {
      title: '6. Sorumluluğun sınırlandırılması',
      blocks: [
        'Site, teknik bakım, güvenlik ve güncelleme çalışmaları nedeniyle geçici olarak erişilemez olabilir. Site sahibi, yürürlükteki emredici mevzuattan doğan sorumlulukları saklı kalmak üzere, kesintisiz veya hatasız çalışma taahhüdünde bulunmaz. Kanunen sınırlandırılamayan sorumluluklar bu hükmün dışındadır. Üçüncü taraf sitelere verilen bağlantıların içeriği ilgili üçüncü tarafların sorumluluğundadır.',
      ],
    },
    {
      title: '7. Değişiklikler',
      blocks: [
        'Koşullardaki değişiklikler bu sayfada yayımlanır ve yürürlük tarihi belirtilir. Esaslı değişiklikler, uygulanmadan önce Site içinde uygun bir yöntemle duyurulur. Değişiklikleri kabul etmeyen kullanıcı Siteyi kullanmayı bırakabilir; üyeler hesap kapatma talebinde bulunabilir. Zorunlu tüketici ve sözleşme hükümleri saklıdır.',
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
        'Yorumların hukuki sorumluluğu, yürürlükteki mevzuatın izin verdiği ölçüde içeriği oluşturan üyeye aittir. Üye, yorum göndererek Site sahibine içeriği yalnızca Sitede barındırma, görüntüleme, teknik olarak çoğaltma, yedekleme ve moderasyon/güvenlik amacıyla inceleme için gerekli, münhasır olmayan ve bedelsiz kullanım izni verir. Bu izin yorum üzerindeki hakların devri anlamına gelmez. Üye, içeriğinin kaldırılması veya düzeltilmesi için ${EMAIL} adresine başvurabilir; hukuki saklama veya uyuşmazlık gereklilikleri ayrıca değerlendirilir.',
      ],
    },
    {
      title: '7. Süre ve fesih',
      blocks: [
        `Sözleşme, üyelik onayıyla yürürlüğe girer ve üyelik sürdüğü müddetçe devam eder. Üye, ${EMAIL} adresine başvurarak hesabının kapatılmasını isteyebilir. Site sahibi, güvenlik veya sözleşme ihlali şüphesinde ölçülü ve gerekli geçici kısıtlamalar uygulayabilir; mümkün olduğunda üyeye gerekçe ve itiraz/inceleme yolu bildirilir. Hesap kapatıldığında kişisel veriler, silme talebi ve saklama yükümlülükleri değerlendirilerek silinir, yok edilir veya anonim hâle getirilir; yorum geçmişi ve moderasyon kayıtları için gerekli saklama ayrıca değerlendirilir.`,
      ],
    },
    {
      title: '8. Değişiklikler',
      blocks: [
        'Site sahibi sözleşme değişikliklerini güncel metni ve yürürlük tarihini yayımlayarak duyurur. Esaslı değişiklikler yürürlüğe girmeden önce üyeye uygun bir bildirim yöntemiyle iletilir. Değişiklikleri kabul etmeyen üye, hesabının kapatılmasını isteyebilir.',
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
        'Site sahibi, kendi oluşturduğu veya yayımladığı içerik bakımından içerik sağlayıcısıdır. Sitenin teknik barındırma altyapısı Cloudflare tarafından sağlanır. Bu altyapı sağlayıcısının bulunması, Site sahibinin 5651 sayılı Kanun kapsamındaki hukuki statüsünü tek başına belirlemez.',
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
