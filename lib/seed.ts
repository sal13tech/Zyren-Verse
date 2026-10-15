import type { Kategori, Urun } from "./types";

export const SEED_KATEGORILER: Kategori[] = [
  { id: "kolyeler", isim: "Kolyeler", sira: 1, sembol: "📿" },
  { id: "kupeler", isim: "Küpeler", sira: 2, sembol: "💎" },
  { id: "bileklikler", isim: "Bileklikler", sira: 3, sembol: "🔗" },
  { id: "yuzukler", isim: "Yüzükler", sira: 4, sembol: "💍" },
];

export const SEED_URUNLER: Urun[] = [
  {
    id: "urun-kugu-kolye",
    isim: "Kuğu Kolye",
    kategoriId: "kolyeler",
    fiyat: 749,
    sembol: "🦢",
    etiket: "ÇOK SEVİLEN",
    aciklama:
      "Zarafeti ve sadeliği bir araya getiren, kuğu sembolümüzden ilham alan özel tasarım.",
    createdAt: 1,
  },
  {
    id: "urun-luna-kupe",
    isim: "Luna Küpe",
    kategoriId: "kupeler",
    fiyat: 529,
    sembol: "✧",
    aciklama: "Ay ışığının zarafetinden ilham alan modern ve sade tasarım.",
    createdAt: 2,
  },
  {
    id: "urun-aurelia-bileklik",
    isim: "Aurelia Bileklik",
    kategoriId: "bileklikler",
    fiyat: 619,
    sembol: "〰",
    etiket: "YENİ",
    aciklama:
      "Minimal çizgileri ve zamansız görünümüyle her stile uyum sağlar.",
    createdAt: 3,
  },
  {
    id: "urun-selene-kolye",
    isim: "Selene Kolye",
    kategoriId: "kolyeler",
    fiyat: 679,
    sembol: "☾",
    aciklama:
      "Gökyüzünün büyüsünü modern tasarımla buluşturan zarif bir kolye.",
    createdAt: 4,
  },
  {
    id: "urun-mira-yuzuk",
    isim: "Mira Yüzük",
    kategoriId: "yuzukler",
    fiyat: 459,
    sembol: "◇",
    aciklama:
      "Geometrik detayları ve yalın tasarımıyla zamansız bir tamamlayıcı.",
    createdAt: 5,
  },
  {
    id: "urun-nova-kupe",
    isim: "Nova Küpe",
    kategoriId: "kupeler",
    fiyat: 579,
    sembol: "✦",
    aciklama:
      "Yıldızlardan ilham alan modern tasarımıyla stiline ışıltı katar.",
    createdAt: 6,
  },
];