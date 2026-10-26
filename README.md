# Semih Algan — Yazılım & Fikirler

Semih Algan için hazırlanmış Türkçe, mobil uyumlu bir yazılım vitrini ve kişisel tanıtım sitesi. Ana sayfada yazılımlar için “çok yakında” duyurusu, biyografi, basketbol ve satranç ilgi alanları ve doğrudan iletişim bağlantıları bulunur.

Bu sürümde ürün listesi, fiyatlar, sepet, satın alma veya ödeme işlemi yoktur. İletişim bölümü e-posta ve telefon uygulamalarını açar; e-posta adresi ayrıca kopyalanabilir. Bilgiler herkese açık olarak gösterilir.

## Teknolojiler

- React 19, TypeScript ve TanStack Start / TanStack Router
- Vite 7 ve Cloudflare Vite eklentisi
- Tailwind CSS 4 ve özel, duyarlı CSS tasarımı
- Lucide React ikonları; CSS ile oluşturulmuş dekoratif görseller
- Veritabanı ve Sunucu: Cloudflare D1 (SQLite) ve Cloudflare Workers / Pages

## Yerel geliştirme

Node.js 22 veya üzeri ve pnpm kullanın.

pnpm install
pnpm dev

Site http://localhost:3000 adresinde açılır. Cloudflare ortamıyla (D1 veritabanı simülasyonu dahil) tam uyumlu çalışmak için Wrangler kullanabilirsiniz:

npx wrangler pages dev

## İçeriği düzenleme

Sayfa metinleri ve iletişim bilgileri src/routes/index.tsx dosyasında, paylaşım başlığı ve açıklaması src/routes/__root.tsx dosyasında bulunur. Renkler, yerleşimler ve mobil stiller src/styles.css dosyasında tanımlanır.

## Geliştirici panosu ve hesaplar

Ana sayfadaki geliştirici panosu yalnızca yöneticinin eklediği gerçek isimleri gösterir. Kurucu, Admin, Moderatör, Developer ve Tasarımcı rolleri seçilebilir.

/giris sayfası kullanıcı adı ve şifreyle giriş, aktivasyon koduyla kayıt ve şifre sıfırlama sunar. /panel kullanıcının özel hesap alanıdır; /admin yalnızca yetkili yöneticilerin erişebildiği yönetim alanıdır.

### İlk kurucu / admin hesabı

Uygulama tamamen özel bir Cloudflare D1 tabanlı kimlik doğrulama sistemi kullanır. İlk kurucu hesabını oluşturmak için sistemde bir bootstrap (ilk kurulum) API'si bulunur:

1. Cloudflare Dashboard üzerinden (veya yerel test için .dev.vars dosyanızda) SETUP_TOKEN adında gizli bir ortam değişkeni (şifre) belirleyin.
2. Kurulum henüz yapılmadıysa, bir HTTP istemcisi (Örn: Postman, cURL veya tarayıcı konsolu fetch) ile /api/community/bootstrap adresine şu POST isteğini gönderin:
   
   {
     "token": "BELIRLEDIGINIZ_SETUP_TOKEN",
     "email": "kendi-epostaniz@domain.com",
     "password": "CokGucluBirSifre123!"
   }
   
3. İşlem başarılı olduğunda, sistem size admin kullanıcı adıyla, "Kurucu" rolüne sahip ilk hesabı oluşturacaktır.
4. Ardından /giris sayfasına gidip "Kurucu / admin girişi" seçeneği ile bu e-posta ve şifreyi kullanarak giriş yapabilirsiniz.

Not: İlk kurucu hesabı oluşturulduktan sonra, güvenlik amacıyla bootstrap işlemi tamamen devre dışı kalır.

### Kullanıcı davet etme

Admin panelindeki Kullanıcılar bölümüne kullanıcının kullanıcı adını ve e-postasını yazın. Kullanıcı adı 3–32 karakter olmalı.
Oluşturulan aktivasyon kodunu güvenli bir kanaldan kullanıcıya iletin. Kod yalnızca oluşturulduğu ekranda gösterilir ve 48 saat içinde tek seferlik kullanılabilir. 
Şifre sıfırlama bağlantıları Resend API kullanılarak kayıtlı e-postaya gönderilir.

### Güvenlik ve kalıcı veri

Tüm hesaplar, geliştirici panosu, blog yazıları ve davet kayıtları Cloudflare D1 (SQLite) üzerinde tutulur. Şifreler PBKDF2 algoritması ve tuzlama (salt) ile özetlenir (hash). Aktivasyon kodları ve oturum (session) belirteçleri veritabanında yalnızca SHA-256 özetleriyle saklanır.

Yönetim işlemleri sunucuda doğrulanmış oturum ve yetki seviyelerine göre korunur. Kaba kuvvet (Brute-force) saldırılarına karşı hem IP hem de Hesap tabanlı Rate Limiting uygulanmaktadır. Veritabanına manuel müdahale etmek için Cloudflare Dashboard'u veya wrangler d1 execute komutlarını kullanabilirsiniz.
