"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { girisYapildiMi, cikisYap } from "@/lib/auth";

const MENULER = [
  { href: "/admin", isim: "Dashboard", ikon: "📊" },
  { href: "/admin/urunler", isim: "Ürünler", ikon: "📦" },
  { href: "/admin/kategoriler", isim: "Kategoriler", ikon: "🗂️" },
  { href: "/admin/ayarlar", isim: "Ayarlar", ikon: "⚙️" },
];

export default function AdminKorumaliLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [kontrolEdildi, setKontrolEdildi] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);

  useEffect(() => {
    if (!girisYapildiMi()) {
      router.replace("/admin/giris");
    } else {
      setKontrolEdildi(true);
    }
  }, [router]);

  useEffect(() => {
    setMenuAcik(false);
  }, [pathname]);

  function cikis() {
    cikisYap();
    router.replace("/admin/giris");
  }

  if (!kontrolEdildi) {
    return (
      <div className="admin-yukleniyor">
        <style jsx>{`
          .admin-yukleniyor {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f5f4f1;
            color: #999;
            font-family: system-ui, sans-serif;
            font-size: 13px;
            letter-spacing: 2px;
          }
        `}</style>
        YÜKLENİYOR…
      </div>
    );
  }

  const aktifBaslik = MENULER.find((m) => m.href === pathname)?.isim ?? "Yönetim";

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }
        body { background: #f5f4f1; color: #171717; font-family: system-ui, -apple-system, sans-serif; }
        button { font: inherit; cursor: pointer; }
        
        .admin-kabuk {
          display: grid;
          grid-template-columns: 250px 1fr;
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 5%, rgba(213, 198, 169, 0.18), transparent 25%),
            radial-gradient(circle at 85% 15%, rgba(215, 221, 224, 0.28), transparent 28%),
            linear-gradient(135deg, #f7f6f3 0%, #ffffff 45%, #f0f0ed 100%);
        }

        .admin-sidebar {
          display: flex;
          flex-direction: column;
          padding: 24px 18px;
          border-right: 1px solid rgba(20, 20, 20, 0.07);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(140%);
        }

        .admin-marka {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding-bottom: 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.07);
          text-decoration: none;
          color: inherit;
        }

        .admin-marka img {
          width: 80px;
          height: 54px;
          object-fit: contain;
        }

        .admin-marka span {
          color: #8f8a82;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 4px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .admin-grup-baslik {
          margin: 14px 0 6px;
          padding: 0 10px;
          color: #a89c8c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .admin-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          color: #666 !important;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s, color 0.2s;
        }

        .admin-link:hover {
          background: rgba(168, 138, 86, 0.1);
          color: #8f733f !important;
        }

        .admin-link.aktif {
          background: #171717;
          color: #fff !important;
        }

        .admin-link-ikon { font-size: 16px; line-height: 1; }

        .admin-cikis {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          padding: 11px 14px;
          border: 1px solid rgba(20, 20, 20, 0.1);
          border-radius: 12px;
          background: transparent;
          color: #a04040;
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          width: 100%;
        }
        .admin-cikis:hover { background: rgba(180, 90, 90, 0.08); }

        .admin-icerik-alani { display: flex; flex-direction: column; min-width: 0; }

        .admin-ust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 22px 40px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.07);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .admin-ust-sol { display: flex; align-items: center; gap: 12px; min-width: 0; }

        .admin-ust h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-ust-link {
          color: #8f733f !important;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .admin-icerik { flex: 1; padding: 32px 40px 60px; min-width: 0; }

        .admin-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(20, 20, 20, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 18px;
          flex-shrink: 0;
        }

        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 90;
          border: 0;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(4px);
          cursor: default;
        }

        @media (max-width: 820px) {
          .admin-kabuk { grid-template-columns: 1fr; }
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 100;
            width: 280px;
            max-width: 85vw;
            height: 100dvh;
            overflow-y: auto;
            transform: translateX(-100%);
            transition: transform 0.28s ease;
            box-shadow: 20px 0 60px rgba(20, 20, 20, 0.15);
          }
          .admin-sidebar.acik { transform: translateX(0); }
          .admin-hamburger { display: inline-flex; }
          .admin-overlay.gorunur { display: block; }
          .admin-ust { padding: 14px 16px; }
          .admin-ust h1 { font-size: 18px; letter-spacing: 0.5px; }
          .admin-ust-link { font-size: 11px; }
          .admin-icerik { padding: 20px 16px 60px; }
        }

        @media (max-width: 480px) {
          .admin-ust h1 { font-size: 16px; }
          .admin-ust-link { display: none; }
        }
      `}</style>

      <div className="admin-kabuk">
        <button
          type="button"
          className={`admin-overlay ${menuAcik ? "gorunur" : ""}`}
          aria-label="Menüyü kapat"
          onClick={() => setMenuAcik(false)}
        />

        <aside className={`admin-sidebar ${menuAcik ? "acik" : ""}`}>
          <Link href="/admin" className="admin-marka" onClick={() => setMenuAcik(false)}>
            <img src="/zyren-logo.png" alt="ZYREN VERSÉ" />
            <span>YÖNETİM</span>
          </Link>

          <nav className="admin-nav">
            <div className="admin-grup-baslik">MENÜ</div>
            {MENULER.map((m) => {
              const aktif = pathname === m.href;
              return (
                <Link key={m.href} href={m.href} className={`admin-link ${aktif ? "aktif" : ""}`}>
                  <span className="admin-link-ikon" aria-hidden="true">{m.ikon}</span>
                  {m.isim}
                </Link>
              );
            })}

            <div className="admin-grup-baslik">SİTE</div>
            <Link href="/" className="admin-link">
              <span className="admin-link-ikon" aria-hidden="true">🌐</span>
              Mağazayı Gör
            </Link>
          </nav>

          <button type="button" className="admin-cikis" onClick={cikis}>
            <span aria-hidden="true">🚪</span>
            Çıkış Yap
          </button>
        </aside>

        <div className="admin-icerik-alani">
          <header className="admin-ust">
            <div className="admin-ust-sol">
              <button type="button" className="admin-hamburger" aria-label="Menüyü aç" onClick={() => setMenuAcik(true)}>☰</button>
              <h1>{aktifBaslik}</h1>
            </div>
            <Link href="/" target="_blank" className="admin-ust-link">MAĞAZAYI GÖR ↗</Link>
          </header>
          <div className="admin-icerik">{children}</div>
        </div>
      </div>
    </>
  );
}