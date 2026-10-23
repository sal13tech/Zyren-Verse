"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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

  // Animasyon ve 3D State'leri
  const [kutuAcik, setKutuAcik] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const kartRef = useRef<HTMLDivElement>(null);

  // Fare Hareketine Göre 3D Eğilme (Tilt)
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!kutuAcik || !kartRef.current) return;
    const rect = kartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Merkeze göre hesaplama
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Eğilme açısı (Maksimum 15 derece)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  if (!hazir) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#111", color: "#a88a56" }}>YÜKLENİYOR…</div>;
  }

  if (!urun) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#111", textAlign: "center", padding: 20 }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#fff" }}>Hediye Bulunamadı 😔</h1>
          <p style={{ color: "#aaa", marginBottom: 24 }}>Bu kutu açılmamış ya da ürün kaldırılmış olabilir.</p>
          <button onClick={() => router.push("/")} style={{ padding: "12px 24px", background: "#a88a56", color: "#fff", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 600 }}>
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
        background: "radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 20, 
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        perspective: "1000px" // 3D derinlik için şart
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* CSS ANİMASYONLARI */}
      <style>{`
        @keyframes sallan {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-3deg) scale(1.02); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(3deg) scale(1.02); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes kapakSol {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-120deg); opacity: 0; }
        }
        @keyframes kapakSag {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(120deg); opacity: 0; }
        }
        @keyframes icerikCikis {
          0% { transform: translateY(50px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes altinParla {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(168,138,86,0.3)); }
          50% { filter: drop-shadow(0 0 30px rgba(168,138,86,0.8)); }
        }
        
        .kutu-sallan { animation: sallan 3s infinite ease-in-out; }
        .parla { animation: altinParla 2s infinite; }
        
        /* 3D Transform Yumuşatma */
        .kart-icerik {
          transition: transform 0.1s ease-out;
          transform-style: preserve-3d;
        }
      `}</style>

      {/* ARKA PLAN IŞIKLARI */}
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 300, height: 300, background: "rgba(168,138,86,0.1)", filter: "blur(100px)", borderRadius: "50%" }}></div>
      <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 300, height: 300, background: "rgba(168,138,86,0.1)", filter: "blur(100px)", borderRadius: "50%" }}></div>

      {/* --- AŞAMA 1: KAPALI KUTU --- */}
      {!kutuAcik && (
        <div style={{ textAlign: "center", zIndex: 10, animation: "icerikCikis 0.8s ease" }}>
          <div className="kutu-sallan" style={{ fontSize: 120, marginBottom: 30, position: "relative" }}>
            🎁
            <div className="parla" style={{ position: "absolute", top: -10, right: -10, fontSize: 30 }}>✨</div>
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#fff", marginBottom: 12 }}>
            Sana Bir Sürpriz Var!
          </h2>
          <p style={{ color: "#888", fontSize: 15, marginBottom: 32 }}>
            <strong style={{ color: "#a88a56" }}>{kimden}</strong> tarafından gönderildi.
          </p>
          <button 
            onClick={() => setKutuAcik(true)}
            style={{ padding: "16px 40px", background: "transparent", border: "1px solid #a88a56", color: "#a88a56", borderRadius: 50, fontSize: 14, fontWeight: 700, letterSpacing: 2, cursor: "pointer", transition: "all 0.3s" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#a88a56"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a88a56"; }}
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
            // 3D Tilt Efekti Burada Uygulanıyor
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            animation: "icerikCikis 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
          }}
        >
          {/* KUTU KAPAKLARI (Arkada kalan süs) */}
          <div style={{ position: "absolute", top: -10, left: -10, right: -10, bottom: -10, background: "linear-gradient(135deg, #222, #111)", borderRadius: 24, transform: "translateZ(-20px)", border: "1px solid rgba(168,138,86,0.3)" }}></div>

          <div style={{ 
            background: "rgba(30, 30, 30, 0.85)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 138, 86, 0.5)", 
            borderRadius: 24, 
            padding: "40px 30px", 
            textAlign: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            transform: "translateZ(20px)" // İçeriği öne çıkar
          }}>
            
            <div style={{ position: "absolute", top: 20, left: 20, fontSize: 24, color: "#a88a56" }}>✨</div>
            <div style={{ position: "absolute", bottom: 20, right: 20, fontSize: 24, color: "#a88a56" }}>✨</div>

            <p style={{ color: "#a88a56", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 8px" }}>
              {kime} İçin Seçildi
            </p>

            {/* ÜRÜN GÖRSELİ */}
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              {urun.gorselUrl ? (
                <img src={urun.gorselUrl} alt={urun.isim} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.5))" }} />
              ) : (
                <span style={{ fontSize: 90, filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.5))" }}>{urun.sembol}</span>
              )}
            </div>

            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#fff", margin: "0 0 8px" }}>{urun.isim}</h3>
            <p style={{ color: "#a88a56", fontSize: 18, fontWeight: 700, margin: "0 0 24px" }}>{PARA(urun.fiyat)}</p>

            {/* HEDİYE NOTU */}
            <div style={{ 
              background: "rgba(168, 138, 86, 0.1)", 
              border: "1px solid rgba(168, 138, 86, 0.2)", 
              padding: "20px", 
              borderRadius: 16, 
              marginBottom: 30,
              position: "relative"
            }}>
              <span style={{ position: "absolute", top: -10, left: 20, background: "#1e1e1e", color: "#a88a56", fontSize: 10, padding: "0 8px", fontWeight: 700, letterSpacing: 1 }}>NOTUNUZ</span>
              <p style={{ margin: 0, fontSize: 14, color: "#ddd", fontStyle: "italic", lineHeight: 1.6 }}>"{not}"</p>
            </div>

            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", background: "#a88a56", color: "#fff", borderRadius: 50, textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: 1, transition: "background 0.2s" }}>
              MAĞAZAYI KEŞFET
            </Link>

            <p style={{ margin: "16px 0 0", fontSize: 11, color: "#666" }}>
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
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#111" }} />}>
      <HediyeIcerik />
    </Suspense>
  );
}