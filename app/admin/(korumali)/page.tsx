"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext";

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (n: number) => TRY_FORMATTER.format(n);

export default function AdminDashboard() {
  const { urunler, kategoriler, hazir } = useStore();
  const [saat, setSaat] = useState<string>("");

  // Canlı Saat Efekti
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSaat(now.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const istatistikler = useMemo(() => {
    const toplamUrun = urunler.length;
    const toplamKategori = kategoriler.length;
    
    const potansiyelCiro = urunler.reduce((t, u) => t + (u.fiyat * (u.stok || 0)), 0);
    const toplamDeger = urunler.reduce((t, u) => t + u.fiyat, 0);
    const ortalamaFiyat = toplamUrun > 0 ? Math.round(toplamDeger / toplamUrun) : 0;
    
    const toplamStok = urunler.reduce((t, u) => t + (u.stok || 0), 0);
    const stoktaOlan = urunler.filter((u) => u.stok > 3).length;
    const kritikStok = urunler.filter((u) => u.stok > 0 && u.stok <= 3).length;
    const tukenenler = urunler.filter((u) => u.stok === 0).length;

    const kategoriDagilimi = kategoriler.map(kat => {
      const katUrunler = urunler.filter(u => u.kategoriId === kat.id);
      const katStok = katUrunler.reduce((t, u) => t + (u.stok || 0), 0);
      return {
        ...kat,
        urunSayisi: katUrunler.length,
        stokSayisi: katStok,
        yuzde: toplamUrun > 0 ? Math.round((katUrunler.length / toplamUrun) * 100) : 0
      };
    }).sort((a, b) => b.urunSayisi - a.urunSayisi);

    // Log / Aktivite Akışı için son eklenenler
    const sonEklenenler = [...urunler].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return {
      toplamUrun,
      toplamKategori,
      potansiyelCiro,
      ortalamaFiyat,
      toplamStok,
      stoktaOlan,
      kritikStok,
      tukenenler,
      kategoriDagilimi,
      sonEklenenler
    };
  }, [urunler, kategoriler]);

  // Zaman Formatlayıcı (Loglar için)
  const zamanFormatla = (ts: number) => {
    const fark = Date.now() - ts;
    const dakika = Math.floor(fark / 60000);
    if (dakika < 1) return "Az önce";
    if (dakika < 60) return `${dakika} dk önce`;
    const saat = Math.floor(dakika / 60);
    if (saat < 24) return `${saat} sa önce`;
    return `${Math.floor(saat / 24)} gün önce`;
  };

  if (!hazir) {
    return <div style={{ padding: "60px 20px", textAlign: "center", color: "#999", letterSpacing: 2 }}>YÜKLENİYOR…</div>;
  }

  const cardStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.04)",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(30, 30, 30, 0.03), 0 1px 3px rgba(30, 30, 30, 0.02)",
    padding: 24,
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 40, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* ÜST BİLGİ ÇUBUĞU (Sistem Durumu ve Saat) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#2e7d32", boxShadow: "0 0 8px rgba(46, 125, 50, 0.6)", animation: "pulse 2s infinite" }}></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", letterSpacing: 1 }}>SİSTEM ÇEVRİMİÇİ</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
          Yerel Saat: <span style={{ color: "#171717" }}>{saat}</span>
        </div>
      </div>

      {/* KARŞILAMA */}
      <div style={{ ...cardStyle, background: "linear-gradient(135deg, #fdfbf7, #ffffff)", borderLeft: "4px solid #a88a56", padding: "26px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 500, color: "#171717" }}>Yönetim Merkezi</h2>
          <p style={{ margin: 0, color: "#7d7d7d", fontSize: 13 }}>Tüm mağaza operasyonlarına buradan hakim olun.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" target="_blank" style={{ padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#333", textDecoration: "none" }}>
            Siteyi Gör ↗
          </Link>
          <Link href="/admin/urunler" style={{ padding: "10px 20px", backgroundColor: "#171717", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            + Hızlı Ürün Ekle
          </Link>
        </div>
      </div>

      {/* METRİKLER */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        
        <div style={{ ...cardStyle, borderTop: "3px solid #8f733f" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#8f8a82", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>POTANSİYEL CİRO</span>
            <span style={{ fontSize: 18 }}>💰</span>
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#171717", fontWeight: 500, marginBottom: 4 }}>{PARA(istatistikler.potansiyelCiro)}</div>
          <div style={{ color: "#999", fontSize: 11, fontWeight: 500 }}>stoktaki toplam değer</div>
        </div>

        <div style={{ ...cardStyle, borderTop: "3px solid #171717" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#8f8a82", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ENVANTER</span>
            <span style={{ fontSize: 18 }}>📦</span>
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#171717", fontWeight: 500, marginBottom: 4 }}>{istatistikler.toplamStok} <span style={{ fontSize: 14, color: "#999" }}>adet</span></div>
          <div style={{ color: "#999", fontSize: 11, fontWeight: 500 }}>fiziksel ürün sayısı</div>
        </div>

        <div style={{ ...cardStyle, borderTop: "3px solid #2e7d32" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#8f8a82", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ÜRÜN ÇEŞİDİ</span>
            <span style={{ fontSize: 18 }}>🏷️</span>
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#171717", fontWeight: 500, marginBottom: 4 }}>{istatistikler.toplamUrun}</div>
          <div style={{ color: "#999", fontSize: 11, fontWeight: 500 }}>{istatistikler.toplamKategori} kategoride</div>
        </div>

        <div style={{ ...cardStyle, borderTop: "3px solid #c62828" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#8f8a82", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>STOK UYARISI</span>
            <span style={{ fontSize: 18 }}>⚠️</span>
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, color: istatistikler.kritikStok > 0 ? "#c62828" : "#171717", fontWeight: 500, marginBottom: 4 }}>{istatistikler.kritikStok + istatistikler.tukenenler}</div>
          <div style={{ color: "#999", fontSize: 11, fontWeight: 500 }}>kritik veya tükenmiş ürün</div>
        </div>

      </div>

      {/* ORTA ALAN (Grafik ve Log Akışı) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
        
        {/* KATEGORİ GRAFİĞİ */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "Georgia, serif", fontSize: 18, color: "#171717", fontWeight: 600 }}>Kategori Dağılımı</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {istatistikler.kategoriDagilimi.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999" }}>Henüz kategori yok.</p>
            ) : (
              istatistikler.kategoriDagilimi.map((kat) => (
                <div key={kat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#444", marginBottom: 6 }}>
                    <span>{kat.sembol} {kat.isim}</span>
                    <span>{kat.urunSayisi} Ürün</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "rgba(20,20,20,0.05)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "#171717", borderRadius: 10, width: `${kat.yuzde}%`, transition: "width 1s ease" }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CANLI AKTİVİTE AKIŞI (LOG PANELİ) */}
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "Georgia, serif", fontSize: 18, color: "#171717", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
            Son Aktiviteler <span style={{ fontSize: 10, backgroundColor: "#eee", padding: "2px 6px", borderRadius: 4, color: "#666" }}>CANLI</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {istatistikler.sonEklenenler.map((urun, i) => (
              <div key={urun.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", position: "relative" }}>
                {/* Zaman Tüneli Çizgisi */}
                {i !== istatistikler.sonEklenenler.length - 1 && (
                  <div style={{ position: "absolute", left: 5, top: 18, bottom: -16, width: 1, backgroundColor: "#eee" }}></div>
                )}
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#a88a56", marginTop: 4, zIndex: 1, border: "2px solid #fff", boxShadow: "0 0 0 1px #a88a56" }}></div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>Yeni ürün eklendi: <strong style={{ color: "#171717" }}>{urun.isim}</strong></p>
                  <span style={{ fontSize: 10, color: "#999" }}>{zamanFormatla(urun.createdAt)}</span>
                </div>
              </div>
            ))}
            {istatistikler.sonEklenenler.length === 0 && (
              <p style={{ fontSize: 12, color: "#999" }}>Henüz aktivite yok.</p>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
             <Link href="/admin/urunler" style={{ display: "block", textAlign: "center", width: "100%", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#555", textDecoration: "none" }}>
               Tümünü Gör
             </Link>
          </div>
        </div>

      </div>

    </div>
  );
}