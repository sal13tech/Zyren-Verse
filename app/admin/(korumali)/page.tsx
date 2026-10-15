"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/contexts/StoreContext";

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (n: number) => TRY_FORMATTER.format(n);

export default function AdminDashboard() {
  const { urunler, kategoriler, hazir } = useStore();

  const istatistikler = useMemo(() => {
    const toplamDeger = urunler.reduce((t, u) => t + u.fiyat, 0);
    const ortalama =
      urunler.length > 0 ? Math.round(toplamDeger / urunler.length) : 0;

    const enPahali = urunler.reduce<(typeof urunler)[number] | null>(
      (max, u) => (max === null || u.fiyat > max.fiyat ? u : max),
      null,
    );

    return {
      urunSayisi: urunler.length,
      kategoriSayisi: kategoriler.length,
      ortalamaFiyat: ortalama,
      enPahali,
    };
  }, [urunler, kategoriler]);

  if (!hazir) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#999",
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        YÜKLENİYOR…
      </div>
    );
  }

  const kartlar = [
    {
      baslik: "TOPLAM ÜRÜN",
      ikon: "📦",
      deger: istatistikler.urunSayisi,
      alt: "mağazada yayında",
    },
    {
      baslik: "KATEGORİ",
      ikon: "🗂️",
      deger: istatistikler.kategoriSayisi,
      alt: "aktif kategori",
    },
    {
      baslik: "ORTALAMA FİYAT",
      ikon: "💎",
      deger: PARA(istatistikler.ortalamaFiyat),
      alt: "tüm ürünler ortalaması",
    },
    {
      baslik: "EN PAHALI",
      ikon: "⭐",
      deger: istatistikler.enPahali?.isim ?? "—",
      alt: istatistikler.enPahali ? PARA(istatistikler.enPahali.fiyat) : "",
    },
  ];

  const hizliLinkler = [
    {
      href: "/admin/urunler",
      ikon: "📦",
      baslik: "Ürünleri Yönet",
      alt: "Ekle, düzenle, sil",
    },
    {
      href: "/admin/kategoriler",
      ikon: "🗂️",
      baslik: "Kategorileri Yönet",
      alt: "Yeni kategori oluştur",
    },
    {
      href: "/admin/ayarlar",
      ikon: "⚙️",
      baslik: "Ayarlar",
      alt: "Yedekle, sıfırla",
    },
  ];

  return (
    <>
      <div
        style={{
          padding: "26px 28px",
          marginBottom: 26,
          border: "1px solid rgba(255,255,255,0.85)",
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.5))",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.95), 0 18px 45px rgba(30,30,30,0.05)",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontFamily: "Georgia, serif",
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          Hoş geldin 👋
        </h2>
        <p
          style={{
            margin: 0,
            color: "#7d7d7d",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          ZYREN VERSÉ yönetim paneline hoş geldin. Buradan ürünlerini ve
          kategorilerini yönetebilirsin. Değişiklikler anında mağazada görünür.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {kartlar.map((k) => (
          <div
            key={k.baslik}
            style={{
              padding: 22,
              border: "1px solid rgba(255,255,255,0.85)",
              borderRadius: 18,
              background: "rgba(255,255,255,0.6)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), 0 12px 30px rgba(30,30,30,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  color: "#8f8a82",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {k.baslik}
              </span>
              <span style={{ fontSize: 20, opacity: 0.7 }} aria-hidden="true">
                {k.ikon}
              </span>
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: k.baslik === "EN PAHALI" ? 22 : 32,
                fontWeight: 500,
                lineHeight: 1,
                color: "#171717",
              }}
            >
              {k.deger}
            </div>
            <div style={{ marginTop: 8, color: "#a89c8c", fontSize: 11 }}>
              {k.alt}
            </div>
          </div>
        ))}
      </div>

      <h3
        style={{
          margin: "0 0 16px",
          fontFamily: "Georgia, serif",
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        Hızlı Erişim
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {hizliLinkler.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 20px",
              border: "1px solid rgba(20,20,20,0.08)",
              borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              color: "#333",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">
              {h.ikon}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {h.baslik}
              <span style={{ color: "#999", fontSize: 11, fontWeight: 500 }}>
                {h.alt}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}