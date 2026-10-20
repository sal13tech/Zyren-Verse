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
    // 1. Temel Sayılar
    const toplamUrun = urunler.length;
    const toplamKategori = kategoriler.length;
    
    // 2. Finansal Veriler
    const potansiyelCiro = urunler.reduce((t, u) => t + (u.fiyat * (u.stok || 0)), 0);
    const toplamDeger = urunler.reduce((t, u) => t + u.fiyat, 0);
    const ortalamaFiyat = toplamUrun > 0 ? Math.round(toplamDeger / toplamUrun) : 0;
    
    // 3. Envanter Durumu
    const toplamStok = urunler.reduce((t, u) => t + (u.stok || 0), 0);
    const stoktaOlan = urunler.filter((u) => u.stok > 3).length;
    const kritikStok = urunler.filter((u) => u.stok > 0 && u.stok <= 3).length;
    const tukenenler = urunler.filter((u) => u.stok === 0).length;

    // 4. Kategori Dağılımı
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

    // 5. Son Eklenen 4 Ürün
    const sonEklenenler = [...urunler].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

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

  if (!hazir) {
    return <div className="db-yukleniyor">YÜKLENİYOR…</div>;
  }

  return (
    <>
      <style jsx>{`
        .db-yukleniyor { padding: 60px 20px; text-align: center; color: #999; font-size: 13px; letter-spacing: 2px; }

        /* KARŞILAMA */
        .db-karsilama {
          padding: 26px 28px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.5));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 18px 45px rgba(30, 30, 30, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .db-karsilama h2 { margin: 0 0 8px; font-family: Georgia, serif; font-size: 28px; font-weight: 500; letter-spacing: 0.5px; }
        .db-karsilama p { margin: 0; color: #7d7d7d; font-size: 13px; line-height: 1.6; }
        .db-tarih {
          background: rgba(168, 138, 86, 0.1);
          color: #8f733f;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* ANA METRİK KARTLARI */
        .db-grid-metrikler {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .db-metrik-kart {
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.65);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 12px 30px rgba(30, 30, 30, 0.04);
          position: relative;
          overflow: hidden;
        }
        .db-metrik-ust { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .db-metrik-baslik { color: #8f8a82; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;}
        .db-metrik-ikon { font-size: 22px; opacity: 0.8; }
        .db-metrik-deger { font-family: Georgia, serif; font-size: 32px; font-weight: 500; line-height: 1; color: #171717; margin-bottom: 8px; }
        .db-metrik-alt { color: #999; font-size: 11px; font-weight: 500; }
        
        /* Metrik Renk Vurguları */
        .db-metrik-kart.ciro { background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240, 235, 225, 0.8)); border-color: rgba(168,138,86,0.3); }
        .db-metrik-kart.ciro .db-metrik-deger { color: #8f733f; }

        /* ORTA ALAN (Grafik ve Uyarılar) */
        .db-grid-orta {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .db-panel {
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.6);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 12px 30px rgba(30, 30, 30, 0.04);
        }
        .db-panel-baslik {
          margin: 0 0 20px;
          font-family: Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          color: #171717;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* KATEGORİ GRAFİĞİ (CSS BAR CHART) */
        .db-grafik-satir { margin-bottom: 16px; }
        .db-grafik-ust { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #444; margin-bottom: 6px; }
        .db-grafik-bar-arka { height: 8px; background: rgba(20,20,20,0.05); border-radius: 10px; overflow: hidden; }
        .db-grafik-bar-dolu { height: 100%; background: #171717; border-radius: 10px; transition: width 1s ease; }

        /* ENVANTER UYARILARI */
        .db-uyari-list { display: flex; flex-direction: column; gap: 10px; }
        .db-uyari-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;
        }
        .db-uyari-item.stok-var { background: rgba(46, 125, 50, 0.08); color: #2e7d32; }
        .db-uyari-item.stok-kritik { background: rgba(230, 81, 0, 0.08); color: #e65100; }
        .db-uyari-item.stok-yok { background: rgba(198, 40, 40, 0.08); color: #c62828; }
        .db-uyari-sayi { font-family: Georgia, serif; font-size: 18px; font-weight: 700; }

        /* SON EKLENEN ÜRÜNLER */
        .db-son-urunler {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .db-son-urun-kart {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        .db-son-urun-kart:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .db-son-gorsel {
          height: 120px; background: #f9f9f9; display: grid; place-items: center;
          font-size: 40px; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .db-son-gorsel img { width: 100%; height: 100%; object-fit: cover; }
        .db-son-bilgi { padding: 12px; }
        .db-son-bilgi h4 { margin: 0 0 4px; font-family: Georgia, serif; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-son-bilgi p { margin: 0; font-size: 11px; color: #8f733f; font-weight: 700; }

        /* HIZLI ERİŞİM */
        .db-hizli { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .db-hizli-link {
          display: flex; align-items: center; gap: 14px; padding: 18px 20px;
          border: 1px solid rgba(20, 20, 20, 0.08); border-radius: 16px;
          background: rgba(255, 255, 255, 0.55); color: #333 !important;
          text-decoration: none; font-size: 13px; font-weight: 600;
        }
        .db-hizli-ikon { font-size: 22px; line-height: 1; }
        .db-hizli-metin { display: flex; flex-direction: column; gap: 3px; }
        .db-hizli-metin span { color: #999; font-size: 11px; font-weight: 500; }

        /* MOBİL UYUM */
        @media (max-width: 1024px) {
          .db-grid-metrikler { grid-template-columns: repeat(2, 1fr); }
          .db-grid-orta { grid-template-columns: 1fr; }
          .db-son-urunler { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .db-karsilama { padding: 20px; flex-direction: column; align-items: flex-start; }
          .db-karsilama h2 { font-size: 22px; }
          .db-metrik-kart { padding: 16px; }
          .db-metrik-deger { font-size: 24px; }
          .db-panel { padding: 18px; }
          .db-son-urunler { grid-template-columns: 1fr; }
          .db-hizli { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-karsilama">
        <div>
          <h2>Genel Bakış 👋</h2>
          <p>Mağazanın anlık durumu, envanter sağlığı ve son hareketler.</p>
        </div>
        <div className="db-tarih">
          {new Date().toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* METRİKLER */}
      <div className="db-grid-metrikler">
        <div className="db-metrik-kart ciro">
          <div className="db-metrik-ust">
            <span className="db-metrik-baslik">POTANSİYEL CİRO</span>
            <span className="db-metrik-ikon" aria-hidden="true">💰</span>
          </div>
          <div className="db-metrik-deger">{PARA(istatistikler.potansiyelCiro)}</div>
          <div className="db-metrik-alt">stoktaki ürünlerin toplam değeri</div>
        </div>

        <div className="db-metrik-kart">
          <div className="db-metrik-ust">
            <span className="db-metrik-baslik">TOPLAM ÜRÜN</span>
            <span className="db-metrik-ikon" aria-hidden="true">🏷️</span>
          </div>
          <div className="db-metrik-deger">{istatistikler.toplamUrun}</div>
          <div className="db-metrik-alt">{istatistikler.toplamKategori} farklı kategoride</div>
        </div>

        <div className="db-metrik-kart">
          <div className="db-metrik-ust">
            <span className="db-metrik-baslik">TOPLAM STOK</span>
            <span className="db-metrik-ikon" aria-hidden="true">📦</span>
          </div>
          <div className="db-metrik-deger">{istatistikler.toplamStok} <span style={{ fontSize: 14, color: "#999", fontWeight: 400 }}>adet</span></div>
          <div className="db-metrik-alt">depodaki fiziksel ürün sayısı</div>
        </div>

        <div className="db-metrik-kart">
          <div className="db-metrik-ust">
            <span className="db-metrik-baslik">ORTALAMA FİYAT</span>
            <span className="db-metrik-ikon" aria-hidden="true">💎</span>
          </div>
          <div className="db-metrik-deger">{PARA(istatistikler.ortalamaFiyat)}</div>
          <div className="db-metrik-alt">ürün başına düşen ortalama</div>
        </div>
      </div>

      {/* ORTA ALAN: GRAFİK VE UYARILAR */}
      <div className="db-grid-orta">
        
        {/* Kategori Dağılımı */}
        <div className="db-panel">
          <h3 className="db-panel-baslik">Kategori Dağılımı</h3>
          <div>
            {istatistikler.kategoriDagilimi.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999" }}>Henüz kategori yok.</p>
            ) : (
              istatistikler.kategoriDagilimi.map((kat) => (
                <div key={kat.id} className="db-grafik-satir">
                  <div className="db-grafik-ust">
                    <span>{kat.sembol} {kat.isim}</span>
                    <span>{kat.urunSayisi} Ürün · {kat.stokSayisi} Stok</span>
                  </div>
                  <div className="db-grafik-bar-arka">
                    <div className="db-grafik-bar-dolu" style={{ width: `${kat.yuzde}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Envanter Sağlığı */}
        <div className="db-panel">
          <h3 className="db-panel-baslik">Envanter Sağlığı</h3>
          <div className="db-uyari-list">
            <div className="db-uyari-item stok-var">
              <span>✅ Yeterli Stok</span>
              <span className="db-uyari-sayi">{istatistikler.stoktaOlan}</span>
            </div>
            <div className="db-uyari-item stok-kritik">
              <span>⚠️ Kritik Stok (≤3)</span>
              <span className="db-uyari-sayi">{istatistikler.kritikStok}</span>
            </div>
            <div className="db-uyari-item stok-yok">
              <span>❌ Tükenen Ürünler</span>
              <span className="db-uyari-sayi">{istatistikler.tukenenler}</span>
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
             <Link href="/admin/urunler" style={{ fontSize: 12, color: "#8f733f", fontWeight: 600, textDecoration: "none" }}>
               Envanteri Yönet ↗
             </Link>
          </div>
        </div>
      </div>

      {/* SON EKLENEN ÜRÜNLER */}
      <h3 style={{ margin: "0 0 16px", fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: 0.5 }}>
        Son Eklenen Ürünler
      </h3>
      <div className="db-son-urunler">
        {istatistikler.sonEklenenler.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 20, color: "#999", fontSize: 13 }}>Henüz ürün eklenmemiş.</div>
        ) : (
          istatistikler.sonEklenenler.map((urun) => (
            <Link href="/admin/urunler" key={urun.id} className="db-son-urun-kart">
              <div className="db-son-gorsel">
                {urun.gorselUrl ? <img src={urun.gorselUrl} alt={urun.isim} /> : urun.sembol}
              </div>
              <div className="db-son-bilgi">
                <h4>{urun.isim}</h4>
                <p>{PARA(urun.fiyat)} · Stok: {urun.stok}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* HIZLI ERİŞİM */}
      <h3 style={{ margin: "0 0 16px", fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: 0.5 }}>
        Hızlı İşlemler
      </h3>
      <div className="db-hizli">
        <Link href="/admin/urunler" className="db-hizli-link">
          <span className="db-hizli-ikon" aria-hidden="true">📦</span>
          <span className="db-hizli-metin">
            Yeni Ürün Ekle
            <span>Kataloğu güncelle</span>
          </span>
        </Link>
        <Link href="/admin/kategoriler" className="db-hizli-link">
          <span className="db-hizli-ikon" aria-hidden="true">🗂️</span>
          <span className="db-hizli-metin">
            Kategori Düzenle
            <span>Vitrini organize et</span>
          </span>
        </Link>
        <Link href="/admin/ayarlar" className="db-hizli-link">
          <span className="db-hizli-ikon" aria-hidden="true">⚙️</span>
          <span className="db-hizli-metin">
            Sistem Ayarları
            <span>Yedekle ve sıfırla</span>
          </span>
        </Link>
      </div>
    </>
  );
}