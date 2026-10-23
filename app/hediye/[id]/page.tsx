"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/contexts/StoreContext";

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (n: number) => TRY_FORMATTER.format(n);

function HediyeIcerik() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { urunler, hazir } = useStore();

  const id = params.id as string;
  const kimden = searchParams.get("kimden") || "Özel Biri";
  const kime = searchParams.get("kime") || "Sana";
  const not = searchParams.get("not") || "Bu özel parça senin için seçildi.";

  const urun = urunler.find((u) => u.id === id);

  const [kutuAcik, setKutuAcik] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const kartRef = useRef<HTMLDivElement>(null);

  // 3D Eğilme Efekti (Fare hareketine duyarlı)
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!kutuAcik || !kartRef.current) return;
    const rect = kartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Eğilme açısı (Maksimum 20 derece)
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    
    setTilt({ x: rotateX, y: rotateY });
  }

  // Mobil için dokunmatik 3D
  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!kutuAcik || !kartRef.current || e.touches.length === 0) return;
    const rect = kartRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  if (!hazir) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f4f1", color: "#8f733f" }}>YÜKLENİYOR…</div>;
  }

  if (!urun) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f4f1", textAlign: "center", padding: 20 }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#171717" }}>Hediye Bulunamadı 😔</h1>
          <button onClick={() => router.push("/")} style={{ padding: "12px 24px", background: "#171717", color: "#fff", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 600, marginTop: 20 }}>
            Mağazaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <main 
      style={{ 
        minHeight: "100vh", 
        background: "radial-gradient(circle at 50% 0%, #ffffff 0%, #f5f4f1 100%)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 20, 
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        perspective: "1500px" // 3D Derinlik
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
    >
      <style>{`
        @keyframes kutuCikis {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes kurdeleSallan {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        @keyframes altinHalka {
          0% { transform: rotateZ(0deg) rotateX(70deg); }
          100% { transform: rotateZ(360deg) rotateX(70deg); }
        }
        @keyframes parla {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        .kutu-sallan { animation: kurdeleSallan 4s infinite ease-in-out; }
        .kart-icerik { transition: transform 0.1s ease-out; transform-style: preserve-3d; }
        
        /* 3D Dönen Altın Halkalar (Orbiter) */
        .halka {
          position: absolute;
          top: 50%; left: 50%;
          width: 280px; height: 280px;
          margin-top: -140px; margin-left: -140px;
          border: 1px solid rgba(168, 138, 86, 0.3);
          border-radius: 50%;
          animation: altinHalka 12s linear infinite;
          pointer-events: none;
        }
        .halka-2 {
          width: 340px; height: 340px;
          margin-top: -170px; margin-left: -170px;
          animation-duration: 18s;
          animation-direction: reverse;
          border-color: rgba(168, 138, 86, 0.15);
        }
      `}</style>

      {/* ARKA PLAN IŞIKLARI (Krem/Altın tonlarında) */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: 400, height: 400, background: "rgba(213, 198, 169, 0.2)", filter: "blur(100px)", borderRadius: "50%" }}></div>
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, background: "rgba(168, 138, 86, 0.1)", filter: "blur(100px)", borderRadius: "50%" }}></div>

      {/* --- AŞAMA 1: KAPALI KUTU --- */}
      {!kutuAcik && (
        <div style={{ textAlign: "center", zIndex: 10, animation: "kutuCikis 0.8s ease" }}>
          <div className="kutu-sallan" style={{ fontSize: 120, marginBottom: 30, position: "relative", display: "inline-block" }}>
            🎁
            <div style={{ position: "absolute", top: 0, right: -20, fontSize: 30, animation: "parla 2s infinite" }}>✨</div>
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#171717", marginBottom: 12 }}>
            Sana Bir Sürpriz Var!
          </h2>
          <p style={{ color: "#7d7d7d", fontSize: 15, marginBottom: 32 }}>
            <strong style={{ color: "#8f733f" }}>{kimden}</strong> tarafından gönderildi.
          </p>
          <button 
            onClick={() => setKutuAcik(true)}
            style={{ padding: "16px 40px", background: "#171717", border: "1px solid #171717", color: "#fff", borderRadius: 50, fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#8f733f"; e.currentTarget.style.borderColor = "#8f733f"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#171717"; e.currentTarget.style.borderColor = "#171717"; }}
          >
            KUTUYU AÇ
          </button>
        </div>
      )}

      {/* --- AŞAMA 2: AÇILAN 3D KUTU VE ÜRÜN --- */}
      {kutuAcik && (
        <div 
          ref={kartRef}
          className="kart-icerik"
          style={{ 
            width: "100%", 
            maxWidth: 420, 
            position: "relative",
            zIndex: 10,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, // 3D Efekti
            animation: "kutuCikis 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
          }}
        >
          {/* 3D Dönen Altın Halkalar */}
          <div className="halka"></div>
          <div className="halka halka-2"></div>

          {/* KART GÖVDESİ */}
          <div style={{ 
            background: "rgba(255, 255, 255, 0.9)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 138, 86, 0.2)", 
            borderRadius: 24, 
            padding: "45px 30px", 
            textAlign: "center",
            boxShadow: "0 30px 60px rgba(30, 30, 30, 0.08), inset 0 2px 0 #fff",
            transform: "translateZ(30px)", // İçeriği öne çıkar
            position: "relative",
            overflow: "hidden"
          }}>
            
            {/* Köşe Süslemeleri */}
            <div style={{ position: "absolute", top: 15, left: 15, width: 20, height: 20, borderTop: "2px solid #a88a56", borderLeft: "2px solid #a88a56", borderRadius: "4px 0 0 0" }}></div>
            <div style={{ position: "absolute", bottom: 15, right: 15, width: 20, height: 20, borderBottom: "2px solid #a88a56", borderRight: "2px solid #a88a56", borderRadius: "0 0 4px 0" }}></div>

            <p style={{ color: "#8f733f", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 12px" }}>
              {kime} İçin Seçildi
            </p>

            {/* 3D ÜRÜN GÖRSELİ */}
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, transform: "translateZ(50px)" }}>
              {urun.gorselUrl ? (
                <img src={urun.gorselUrl} alt={urun.isim} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.15))" }} />
              ) : (
                <span style={{ fontSize: 100, filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.15))" }}>{urun.sembol}</span>
              )}
            </div>

            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 30, color: "#171717", margin: "0 0 8px" }}>{urun.isim}</h3>
            <p style={{ color: "#8f733f", fontSize: 18, fontWeight: 700, margin: "0 0 24px" }}>{PARA(urun.fiyat)}</p>

            {/* HEDİYE NOTU */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(168,138,86,0.05), rgba(168,138,86,0.15))", 
              border: "1px solid rgba(168, 138, 86, 0.2)", 
              padding: "20px", 
              borderRadius: 16, 
              marginBottom: 30,
              position: "relative"
            }}>
              <span style={{ position: "absolute", top: -9, left: 20, background: "#fff", color: "#a88a56", fontSize: 9, padding: "0 8px", fontWeight: 700, letterSpacing: 1 }}>NOTUNUZ</span>
              <p style={{ margin: 0, fontSize: 14, color: "#444", fontStyle: "italic", lineHeight: 1.6 }}>"{not}"</p>
            </div>

            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", background: "#171717", color: "#fff", borderRadius: 50, textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: "background 0.2s" }}>
              MAĞAZAYI KEŞFET
            </Link>

            <p style={{ margin: "16px 0 0", fontSize: 11, color: "#888" }}>
              Gönderen: {kimden}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HediyeSayfasi() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f4f1" }} />}>
      <HediyeIcerik />
    </Suspense>
  );
}