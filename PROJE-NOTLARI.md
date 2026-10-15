# ZYREN VERSÉ — Proje Notları

> Bu dosya her oturumun başında asistana yapıştırılır.
> Asistan bu dosyayı okuyunca projenin mevcut durumunu anlar.

---

## 🎯 Proje Hakkında

- **Proje:** ZYREN VERSÉ — Takı e-ticaret demo sitesi
- **Amaç:** Portfolyo/demo (gerçek satış yok)
- **Teknoloji:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Veri:** localStorage (backend yok, demo amaçlı)
- **Dil:** Türkçe arayüz ve kod yorumları

---

## 🔐 Admin Girişi

- **URL:** `/admin` (şifre yoksa `/admin/giris`'e yönlendirir)
- **Şifre:** `zyren2026` (demo şifresi, sabit kod içinde)
- **Not:** Gerçek güvenlik değil, sadece demo hissiyatı için

---

## 📁 Mevcut Klasör Yapısı

---

## ✅ Tamamlanan Adımlar

1. **Faz 1 — Veri Katmanı** ✅
   - `lib/types.ts` — Tip tanımları
   - `lib/seed.ts` — Başlangıç ürünleri ve kategorileri
   - `lib/storage.ts` — localStorage katmanı
   - `contexts/StoreContext.tsx` — Merkezi veri yönetimi
   - `app/layout.tsx` — StoreProvider ile sarıldı
   - `app/page.tsx` — Context'e bağlandı (artık dinamik)

2. **Storefront Özellikleri** ✅
   - Ana sayfa (hero + koleksiyon + hikaye + özellikler)
   - Ürün listeleme, arama, kategori filtresi
   - Favoriler (localStorage)
   - Sepet (adet bazlı, localStorage)
   - Ürün detay modalı
   - Hamburger menü
   - Mobil uyumlu

---

## 🚧 Sıradaki Fazlar

### FAZ 2 — Admin Panel İskeleti (BAŞLANMADI)
- [ ] `lib/auth.ts` — Basit şifre kontrolü
- [ ] `app/admin/giris/page.tsx` — Şifre giriş ekranı
- [ ] `app/admin/layout.tsx` — Admin düzeni (sidebar + header)
- [ ] `app/admin/page.tsx` — Dashboard (özet istatistikler)
- [ ] Sidebar menüleri: Dashboard / Ürünler / Kategoriler / Ayarlar / Çıkış

### FAZ 3 — Kategori Yönetimi (BEKLİYOR)
- [ ] Kategori listesi (tablo)
- [ ] Yeni kategori ekleme (modal veya sayfa)
- [ ] Kategori düzenleme
- [ ] Kategori silme (ürün varsa uyarı)
- [ ] Sıralama (yukarı/aşağı butonları)

### FAZ 4 — Ürün Yönetimi (BEKLİYOR)
- [ ] Ürün listesi (tablo, arama, filtre)
- [ ] Yeni ürün ekleme
- [ ] Ürün düzenleme
- [ ] Ürün silme
- [ ] Görsel yükleme: 3 yöntem
  - Emoji sembol (mevcut)
  - Görsel URL
  - **Dosya yükleme** (canvas ile 800px, JPEG %80 sıkıştırma → base64)
- [ ] Form doğrulama (isim zorunlu, fiyat > 0)

### FAZ 5 — Storefront Entegrasyonu (OTOMATİK)
- Admin panelden eklenen ürün anında storefront'ta görünecek (context sayesinde)

### FAZ 6 — Yedekleme (BEKLİYOR)
- [ ] JSON import / export
- [ ] "Fabrika ayarlarına dön" butonu (ayarlar sayfasında)

### FAZ 7 — Cila (BEKLİYOR)
- [ ] Admin dashboard istatistikleri (toplam ürün, kategori, ortalama fiyat)
- [ ] Boş durum ekranları
- [ ] Onay modalları (silme işlemleri için)
- [ ] Toast bildirimleri

---

## 🎨 Tasarım Kararları

- **Storefront:** Açık bej zemin (#f5f4f1), altın vurgu (#a88a56), serif başlıklar (Cormorant Garamond) + sans gövde (Manrope)
- **Admin panel tema:** ❓ KARAR VERİLMEDİ (storefront'a benzer / koyu / sade)
- **Logo:** `public/zyren-logo.png` (beyaz arka planlı, mix-blend-mode: multiply)

---

## 🛠️ Teknik Notlar

- **Path alias:** `@/*` → `./*` (tsconfig.json'da tanımlı)
- **Klasör kuralı:** `lib/` ve `contexts/` **`app`'in kardeşi**, içinde değil
- **ID formatı:** Ürünler `urun-xxx`, kategoriler `kat-xxx` (string)
- **Görsel yükleme:** Base64 sıkıştırma **şart** (localStorage 5MB sınırı)
- **localStorage anahtarları:**
  - `zyren-urunler`
  - `zyren-kategoriler`
  - `zyren-favoriler`
  - `zyren-sepet`
  - `zyren-veri-versiyon` (şema değişince artır)

---

## 🚦 Bir Sonraki Oturumda İlk Yapılacaklar

1. Bu dosyayı asistana yapıştır
2. Şu mesajı ekle: **"Kaldığımız yerden devam edelim — Faz 2'ye geçelim"**
3. Asistana **admin panel tema tercihini** söyle:
   - A) Storefront'a benzer (açık bej + altın)
   - B) Koyu tema
   - C) Sade beyaz

---

*Son güncelleme: [BUGÜNÜN TARİHİNİ YAZ]*