"use client";

export const instant = false;

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
    return <div className="db-yukleniyor">YÜKLENİYOR…</div>;
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
      kucuk: true,
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
      <style jsx>{`
        .db-yukleniyor {
          padding: 60px 20px;
          text-align: center;
          color: #999;
          font-size: 13px;
          letter-spacing: 2px;
        }

        .db-karsilama {
          padding: 26px 28px;
          margin-bottom: 26px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.78),
            rgba(255, 255, 255, 0.5)
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 18px 45px rgba(30, 30, 30, 0.05);
        }

        .db-karsilama h2 {
          margin: 0 0 8px;
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .db-karsilama p {
          margin: 0;
          color: #7d7d7d;
          font-size: 13px;
          line-height: 1.7;
        }

        .db-kartlar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .db-kart {
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.6);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 12px 30px rgba(30, 30, 30, 0.04);
        }

        .db-kart-ust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .db-kart-baslik {
          color: #8f8a82;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .db-kart-ikon {
          font-size: 20px;
          opacity: 0.7;
        }

        .db-kart-deger {
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: 500;
          line-height: 1.1;
          color: #171717;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-kart-deger.kucuk {
          font-size: 22px;
        }

        .db-kart-alt {
          margin-top: 8px;
          color: #a89c8c;
          font-size: 11px;
        }

        .db-bolum-baslik {
          margin: 0 0 16px;
          font-family: Georgia, serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .db-hizli {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .db-hizli-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border: 1px solid rgba(20, 20, 20, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.55);
          color: #333 !important;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .db-hizli-ikon {
          font-size: 22px;
          line-height: 1;
        }

        .db-hizli-metin {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .db-hizli-metin span {
          color: #999;
          font-size: 11px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .db-karsilama {
            padding: 20px 18px;
            margin-bottom: 18px;
            border-radius: 16px;
          }

          .db-karsilama h2 {
            font-size: 22px;
          }

          .db-karsilama p {
            font-size: 12px;
          }

          .db-kartlar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 24px;
          }

          .db-kart {
            padding: 16px 14px;
            border-radius: 14px;
          }

          .db-kart-baslik {
            font-size: 9px;
            letter-spacing: 1px;
          }

          .db-kart-ikon {
            font-size: 16px;
          }

          .db-kart-deger {
            font-size: 22px;
          }

          .db-kart-deger.kucuk {
            font-size: 15px;
          }

          .db-kart-alt {
            font-size: 10px;
            margin-top: 4px;
          }

          .db-bolum-baslik {
            font-size: 17px;
            margin-bottom: 12px;
          }

          .db-hizli {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .db-hizli-link {
            padding: 14px 16px;
            font-size: 12px;
          }

          .db-hizli-ikon {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="db-karsilama">
        <h2>Hoş geldin 👋</h2>
        <p>
          ZYREN VERSÉ yönetim paneline hoş geldin. Buradan ürünlerini ve
          kategorilerini yönetebilirsin. Değişiklikler anında mağazada görünür.
        </p>
      </div>

      <div className="db-kartlar">
        {kartlar.map((k) => (
          <div key={k.baslik} className="db-kart">
            <div className="db-kart-ust">
              <span className="db-kart-baslik">{k.baslik}</span>
              <span className="db-kart-ikon" aria-hidden="true">
                {k.ikon}
              </span>
            </div>
            <div className={`db-kart-deger${k.kucuk ? " kucuk" : ""}`}>
              {k.deger}
            </div>
            <div className="db-kart-alt">{k.alt}</div>
          </div>
        ))}
      </div>

      <h3 className="db-bolum-baslik">Hızlı Erişim</h3>

      <div className="db-hizli">
        {hizliLinkler.map((h) => (
          <Link key={h.href} href={h.href} className="db-hizli-link">
            <span className="db-hizli-ikon" aria-hidden="true">
              {h.ikon}
            </span>
            <span className="db-hizli-metin">
              {h.baslik}
              <span>{h.alt}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}