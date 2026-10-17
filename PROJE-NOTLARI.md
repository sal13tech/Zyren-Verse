# ZYREN VERSÉ — Proje Notları

## 🌐 Canlı Bağlantılar (Vercel)
- **Müşteri Mağazası (Vitrin):** [https://zyren-verse-lilac.vercel.app](https://zyren-verse-lilac.vercel.app)
- **Admin Giriş Ekranı:** [https://zyren-verse-lilac.vercel.app/admin](https://zyren-verse-lilac.vercel.app/admin)
- **Admin Şifresi:** `zyren2026`

---

## 🎯 Proje Hakkında
- **Proje:** ZYREN VERSÉ — Takı e-ticaret demo sitesi
- **Teknoloji:** Next.js 16 + TypeScript
- **Veritabanı:** Neon (Postgres)
- **Deploy:** Vercel 
- **GitHub:** github.com/sal13tech/Zyren-Verse
- **Dil:** Türkçe arayüz ve kod yorumları

## ✅ Tamamlanan Aşamalar
1. **Veri Katmanı & Admin Panel:** Kategoriler ve ürünler için tam CRUD işlemleri, Neon veritabanı bağlantısı.
2. **Mobil Uyum:** Admin paneli ve mağaza tamamen mobil uyumlu hale getirildi.
3. **Mağaza Cilalama (Vitrin):** 
   - Ana sayfa artık sadece en son eklenen 6 ürünü gösteriyor (Vitrin mantığı).
   - Ürün kartlarına "Hemen Sepete Ekle" butonu eklendi.
   - Mobilde ürün kartları yatay (resim solda, yazı sağda) formata dönüştürüldü.
   - "Benzer Ürünler" (Modal içinde) eklendi.
   - Sepet ve Favoriler panellerine "Tümünü Ekle" ve "Temizle" gibi UX özellikleri eklendi.
4. **Görsel İyileştirmeler:** Logo şeffaf hale getirildi, ana sayfa (hero) logosu büyütüldü.
5. **Ayarlar:** JSON yedekleme, geri yükleme ve fabrika ayarlarına dönme aktif.

## 🚧 Sıradaki Aşama (Yarına Kaldı)
**Vercel Blob ile Ürün Görseli Yükleme (Faz 9):**
- Vercel'de `zyren-gorseller` adında yeni bir Blob deposu oluşturulacak (Access: Public).
- Admin ürün ekleme formuna "Görsel Yükle" alanı eklenecek.
- Resimler tarayıcıda otomatik olarak boyutlandırılıp (max 800px, JPEG %80) Vercel Blob'a yüklenecek.
- Ürün kartlarında emoji yerine yüklenen gerçek fotoğraf görünecek.

## 🛠️ Teknik Notlar
- **Klasör kuralı:** `lib/` ve `contexts/` app'in kardeşi.
- **Cache Components:** `next.config.ts` içinde KAPALI.
- **Env var:** Vercel'de Neon bağlantıları (DATABASE_URL vb.) mevcut.

---
Son güncelleme: 17 Ekim 2026