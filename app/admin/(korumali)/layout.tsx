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

  useEffect(() => {
    if (!girisYapildiMi()) {
      router.replace("/admin/giris");
    } else {
      setKontrolEdildi(true);
    }
  }, [router]);

  function cikis() {
    cikisYap();
    router.replace("/admin/giris");
  }

  if (!kontrolEdildi) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f4f1",
          color: "#999",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        YÜKLENİYOR…
      </div>
    );
  }

  const aktifBaslik =
    MENULER.find((m) => m.href === pathname)?.isim ?? "Yönetim";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 5%, rgba(213,198,169,0.18), transparent 25%), radial-gradient(circle at 85% 15%, rgba(215,221,224,0.28), transparent 28%), linear-gradient(135deg, #f7f6f3 0%, #ffffff 45%, #f0f0ed 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#171717",
      }}
    >
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px 18px",
          borderRight: "1px solid rgba(20,20,20,0.07)",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        <Link
          href="/admin"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            paddingBottom: 22,
            marginBottom: 22,
            borderBottom: "1px solid rgba(20,20,20,0.07)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zyren-logo.png"
            alt="ZYREN VERSÉ"
            style={{
              width: 80,
              height: 54,
              objectFit: "contain",
              mixBlendMode: "multiply",
            }}
          />
          <span
            style={{
              color: "#8f8a82",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            YÖNETİM
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flex: 1,
          }}
        >
          <div
            style={{
              margin: "14px 0 6px",
              padding: "0 10px",
              color: "#a89c8c",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            MENÜ
          </div>

          {MENULER.map((m) => {
            const aktif = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  background: aktif ? "#171717" : "transparent",
                  color: aktif ? "#fff" : "#666",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{ fontSize: 16, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {m.ikon}
                </span>
                {m.isim}
              </Link>
            );
          })}

          <div
            style={{
              margin: "14px 0 6px",
              padding: "0 10px",
              color: "#a89c8c",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            SİTE
          </div>

          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 12,
              color: "#666",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">
              🌐
            </span>
            Mağazayı Gör
          </Link>
        </nav>

        <button
          type="button"
          onClick={cikis}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            padding: "11px 14px",
            border: "1px solid rgba(20,20,20,0.1)",
            borderRadius: 12,
            background: "transparent",
            color: "#a04040",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "left",
            cursor: "pointer",
            width: "100%",
          }}
        >
          <span aria-hidden="true">🚪</span>
          Çıkış Yap
        </button>
      </aside>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "22px 40px",
            borderBottom: "1px solid rgba(20,20,20,0.07)",
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            {aktifBaslik}
          </h1>

          <Link
            href="/"
            target="_blank"
            style={{
              color: "#8f733f",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            MAĞAZAYI GÖR ↗
          </Link>
        </header>

        <div
          style={{
            flex: 1,
            padding: "32px 40px 60px",
            minWidth: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}