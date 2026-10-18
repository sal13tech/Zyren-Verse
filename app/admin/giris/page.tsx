"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { girisYap, girisYapildiMi } from "@/lib/auth";

export default function AdminGiris() {
  const router = useRouter();
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (girisYapildiMi()) {
      router.replace("/admin");
    }
  }, [router]);

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    window.setTimeout(() => {
      if (girisYap(sifre)) {
        router.replace("/admin");
      } else {
        setHata("Şifre hatalı. Tekrar dene.");
        setYukleniyor(false);
      }
    }, 300);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 20% 10%, rgba(213,198,169,0.35), transparent 30%), radial-gradient(circle at 85% 20%, rgba(215,221,224,0.5), transparent 32%), linear-gradient(135deg, #f7f6f3 0%, #ffffff 45%, #f0f0ed 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#171717",
      }}
    >
      <form
        onSubmit={gonder}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "40px 34px",
          border: "1px solid rgba(255,255,255,0.85)",
          borderRadius: 28,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(25px) saturate(140%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.95), 0 30px 70px rgba(30,30,30,0.09)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zyren-logo.png"
          alt="ZYREN VERSÉ"
          style={{
            display: "block",
            width: 90,
            height: 62,
            margin: "0 auto 12px",
            objectFit: "contain",
          }}
        />

        <h1
          style={{
            margin: "0 0 8px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 3,
          }}
        >
          Yönetim Paneli
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            textAlign: "center",
            color: "#8f8a82",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          ZYREN VERSÉ · Demo
        </p>

        <label
          htmlFor="sifre"
          style={{
            display: "block",
            marginBottom: 6,
            color: "#555",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          ŞİFRE
        </label>

        <input
          id="sifre"
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="••••••••"
          autoFocus
          style={{
            width: "100%",
            minHeight: 46,
            padding: "0 16px",
            border: "1px solid rgba(20,20,20,0.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,0.8)",
            color: "#171717",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={yukleniyor || sifre.length === 0}
          style={{
            width: "100%",
            minHeight: 48,
            marginTop: 16,
            border: "1px solid #171717",
            borderRadius: 50,
            background: "#171717",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            cursor:
              yukleniyor || sifre.length === 0 ? "not-allowed" : "pointer",
            opacity: yukleniyor || sifre.length === 0 ? 0.6 : 1,
          }}
        >
          {yukleniyor ? "KONTROL EDİLİYOR…" : "GİRİŞ YAP"}
        </button>

        {hata && (
          <div
            style={{
              marginTop: 14,
              padding: "11px 14px",
              border: "1px solid rgba(180,90,90,0.3)",
              borderRadius: 12,
              background: "rgba(255,240,240,0.75)",
              color: "#a04040",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {hata}
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px dashed rgba(20,20,20,0.1)",
            color: "#999",
            fontSize: 10,
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Demo şifresi:{" "}
          <strong style={{ color: "#8f733f" }}>zyren2026</strong>
        </div>
      </form>
    </main>
  );
}