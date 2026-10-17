# Semih Algan — Yazılım & Fikirler

Semih Algan için hazırlanmış Türkçe, mobil uyumlu bir yazılım vitrini ve kişisel tanıtım sitesi. Ana sayfada yazılımlar için “çok yakında” duyurusu, biyografi, basketbol ve satranç ilgi alanları ve doğrudan iletişim bağlantıları bulunur.

Bu sürümde ürün listesi, fiyatlar, sepet, satın alma veya ödeme işlemi yoktur. İletişim bölümü e-posta ve telefon uygulamalarını açar; e-posta adresi ayrıca kopyalanabilir. Bilgiler herkese açık olarak gösterilir.

## Teknolojiler

- React 19, TypeScript ve TanStack Start / TanStack Router
- Vite 7 ve Netlify TanStack Start eklentisi
- Tailwind CSS 4 ve özel, duyarlı CSS tasarımı
- Lucide React ikonları; CSS ile oluşturulmuş dekoratif görseller
- Google Fonts üzerinden Manrope ve DM Sans; harici fontlar yüklenemezse yerel sans-serif yedeği

## Yerel geliştirme

Node.js 22 veya üzeri ve pnpm kullanın.

```sh
pnpm install
pnpm dev
```

Site `http://localhost:3000` adresinde açılır. Netlify ortamıyla çalışmak için Netlify CLI kuruluysa:

```sh
netlify dev --port 8889
```

Üretim derlemesi Netlify dağıtım sürecinde otomatik olarak çalıştırılır.

## İçeriği düzenleme

Sayfa metinleri ve iletişim bilgileri `src/routes/index.tsx` dosyasında, paylaşım başlığı ve açıklaması `src/routes/__root.tsx` dosyasında bulunur. Renkler, yerleşimler ve mobil stiller `src/styles.css` dosyasında tanımlanır.

## Geliştirici panosu ve hesaplar

Ana sayfadaki geliştirici panosu yalnızca yöneticinin eklediği gerçek isimleri gösterir. Kurucu, Admin, Moderatör, Developer ve Tasarımcı rolleri seçilebilir; isimler düzenlenebilir ve panodan kaldırılabilir. Bu roller tanıtım amaçlıdır ve yönetim yetkisi vermez. Ticaret, ödeme veya örnek ürün içeriği eklenmemiştir.

`/giris` sayfası kullanıcı adı ve şifreyle giriş, aktivasyon koduyla kayıt ve şifre sıfırlama sunar. `/panel` kullanıcının özel hesap alanıdır; `/admin` yalnızca yetkili yöneticilerin erişebildiği yönetim alanıdır. Şifre alanlarının tamamında göster/gizle düğmesi bulunur; şifreler başlangıçta gizlidir.

### İlk kurucu / admin hesabı

İlk yönetici, herkese açık bir kurulum formundan veya sabit şifreden oluşturulmaz. Netlify proje yöneticisi aşağıdaki güvenli kurulum adımlarını tamamlamalıdır:

1. Dağıtımdan sonra projenin Identity bölümünü açın ve kayıt politikasını **Invite only** olarak ayarlayın. Uygulamanın Identity doğrulama işleyicisi ayrıca açık kaydı reddeder.
2. Identity kullanıcı yönetiminden kendi e-posta adresinizi davet edin. Hesaba **admin** veya **founder** uygulama rolünü atayın. Rolü davet bağlantısı kabul edilmeden önce atayın; yalnızca panoya “Kurucu” yazmak yetki vermez.
3. Davet e-postasındaki bağlantıyı açın. Site sizi şifre oluşturma ekranına yönlendirir. En az 12 karakterlik güçlü bir şifre oluşturun.
4. Kullanıcı panelinden **Admin paneli** bağlantısını açın. Sonraki girişlerde `/giris` ekranındaki **Kurucu / admin girişi** seçeneğiyle e-posta ve şifrenizi kullanabilirsiniz. İlk girişte oluşturulan özel kullanıcı adınız hesap bilgilerinizde görünür; bu kullanıcı adıyla normal giriş de yapabilirsiniz.

Identity etkinleştirme işareti projeye eklenmiştir. Netlify daveti ve yönetici rolünün atanması proje sahibinin hesabından tamamlanmalıdır; bu değişiklik hiçbir kişiye otomatik yönetici yetkisi tanımaz.

### Kullanıcı davet etme

Admin panelindeki **Kullanıcılar** bölümüne kullanıcının kullanıcı adını ve e-postasını yazın. Kullanıcı adı 3–32 karakter olmalı; küçük Latin harfleri, rakamlar, nokta, tire ve alt çizgi kullanılabilir.

Oluşturulan aktivasyon kodunu güvenli bir kanaldan kullanıcıya iletin. Kod yalnızca oluşturulduğu ekranda gösterilir, 48 saat içinde ve yalnızca bir kez kullanılabilir. Sayfadan ayrılmadan kodu kopyalayın. Kullanıcı giriş ekranında **Hesabın yok mu? Kayıt ol** seçeneğini açar, kodunu doğrular ve ardından kendi şifresini oluşturur. Aktivasyon tamamlanınca kullanıcı adı ve şifresiyle giriş yapabilir.

Bekleyen hesaplar için yeni kod üretilebilir; bu işlem önceki kodları geçersiz kılar. Aktif hesaplar için aktivasyon kodu yeniden üretilmez; şifre yenileme e-postası veya kullanıcının paneli kullanılır. Davet ekranı e-posta göndermez; kodun iletilmesi yöneticinin sorumluluğundadır. Şifre sıfırlama bağlantıları Identity tarafından kayıtlı e-postaya gönderilir.

### Güvenlik ve kalıcı veri

Hesaplar Netlify Identity, geliştirici panosu ve davet kayıtları Netlify Database üzerinde tutulur. Şifreler uygulama veritabanına kaydedilmez ve yöneticilere gösterilmez. Aktivasyon kodları veritabanında yalnızca SHA-256 özetleriyle saklanır. Kod tüketimi ve hesap aktivasyonu satır kilitli işlemle yapılır; eşzamanlı kullanım ve eski kodlarla yeniden kayıt engellenir.

Yönetim işlemleri sunucuda doğrulanmış oturum ve **admin** / **founder** rolü gerektirir. Değişiklik istekleri aynı kaynak kontrolüyle korunur; giriş, aktivasyon ve şifre sıfırlama denemeleri kalıcı veritabanı sayaçlarıyla sınırlandırılır. Aktivasyon bekleyen veya uygulamaya kayıtlı olmayan kullanıcıların doğrudan Identity üzerinden giriş yapması da reddedilir. Kullanıcıların e-postaları ve hesap bilgileri herkese açık panoda paylaşılmaz.

Veritabanı şeması `db/schema.ts`, bağlantı `db/index.ts`, API işlemleri `netlify/functions/community.mts` içinde tanımlıdır. Drizzle geçişleri `netlify/database/migrations/` altında tutulur ve dağıtım sırasında uygulanır. Yeni bir şema değişikliğinde önce `netlify db status` ile durumu kontrol edin, ardından `pnpm exec drizzle-kit generate --name <aciklayici_ad>` ile geçiş üretin. Uygulanmış geçişleri değiştirmeyin.

Bu otomatik düzenleme sırasında yerel sunucu, derleme, test veya tip kontrolü çalıştırılmaz. Doğrulama dağıtım sürecine bırakılır.
