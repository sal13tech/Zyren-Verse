"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { useStore } from "@/contexts/StoreContext";
import type { Urun } from "@/lib/types";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (fiyat: number) => TRY_FORMATTER.format(fiyat);

const FAVORI_ANAHTARI = "zyren-favoriler";
const SEPET_ANAHTARI = "zyren-sepet";
const HEPSI = "hepsi";

type Sepet = Record<string, number>;

function stringDizisiOku(anahtar: string): string[] {
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return [];
    const parsed: unknown = JSON.parse(ham);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function sepetOku(anahtar: string): Sepet {
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return {};
    const parsed: unknown = JSON.parse(ham);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const sonuc: Sepet = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && v > 0) {
        sonuc[k] = Math.floor(v);
      }
    }
    return sonuc;
  } catch {
    return {};
  }
}

type UrunKartiProps = {
  urun: Urun;
  kategoriIsmi: string;
  favoriMi: boolean;
  sepetteAdet: number;
  onFavori: (id: string) => void;
  onDetay: (urun: Urun) => void;
  onSepeteEkle: (id: string) => void;
};

function UrunKarti({
  urun,
  kategoriIsmi,
  favoriMi,
  sepetteAdet,
  onFavori,
  onDetay,
  onSepeteEkle,
}: UrunKartiProps) {
  function klavyeIleAc(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDetay(urun);
    }
  }

  return (
    <article
      className="urun-kart"
      role="button"
      tabIndex={0}
      aria-label={`${urun.isim} ürün detaylarını aç`}
      onClick={() => onDetay(urun)}
      onKeyDown={klavyeIleAc}
    >
      <div className="urun-gorsel">
        {urun.etiket && (
          <span className={`urun-etiket ${urun.etiket === "YENİ" ? "yeni-parla" : ""}`}>
            {urun.etiket}
          </span>
        )}

        <button
          type="button"
          className={`favori-kalp ${favoriMi ? "aktif" : ""}`}
          aria-label={favoriMi ? "Favorilerden çıkar" : "Favorilere ekle"}
          onClick={(event) => {
            event.stopPropagation();
            onFavori(urun.id);
          }}
        >
          {favoriMi ? "♥" : "♡"}
        </button>

        {urun.gorselUrl ? (
          <img
            className="urun-gorsel-img"
            src={urun.gorselUrl}
            alt={urun.isim}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="urun-sembol" aria-hidden="true">
            {urun.sembol}
          </span>
        )}
      </div>

      <div className="urun-bilgi">
        <div className="urun-kategori">{kategoriIsmi}</div>
        <h3>{urun.isim}</h3>
        <p className="urun-aciklama">{urun.aciklama}</p>

        <div className="urun-alt">
          <span className="urun-fiyat">{PARA(urun.fiyat)}</span>
          <button
            type="button"
            className="urun-incele"
            onClick={(event) => {
              event.stopPropagation();
              onDetay(urun);
            }}
          >
            DETAYLAR <span aria-hidden="true">↗</span>
          </button>
        </div>
        
        <button
          type="button"
          className={`hizli-sepet-btn ${sepetteAdet > 0 ? "sepette" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onSepeteEkle(urun.id);
          }}
        >
          {sepetteAdet > 0 ? `SEPETTE (${sepetteAdet}) · +1 EKLE` : "HEMEN SEPETE EKLE"}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { urunler, kategoriler, hazir, kategoriBul } = useStore();

  const [sayfa, setSayfa] = useState<"ana" | "urunler">("ana");
  const [arama, setArama] = useState("");
  const [kategoriId, setKategoriId] = useState<string>(HEPSI);

  const [favoriler, setFavoriler] = useState<string[]>([]);
  const [sepet, setSepet] = useState<Sepet>({});

  const [menuAcik, setMenuAcik] = useState(false);
  const [favorilerAcik, setFavorilerAcik] = useState(false);
  const [sepetAcik, setSepetAcik] = useState(false);

  const [seciliUrun, setSeciliUrun] = useState<Urun | null>(null);
  const [bildirim, setBildirim] = useState("");

  const [hydrated, setHydrated] = useState(false);

  const detayKapatRef = useRef<HTMLButtonElement>(null);

  const herhangiBirPanelAcik =
    menuAcik || favorilerAcik || sepetAcik || Boolean(seciliUrun);

  useEffect(() => {
    setFavoriler(stringDizisiOku(FAVORI_ANAHTARI));
    setSepet(sepetOku(SEPET_ANAHTARI));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVORI_ANAHTARI, JSON.stringify(favoriler));
    } catch {
      console.warn("Favoriler kaydedilemedi.");
    }
  }, [favoriler, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SEPET_ANAHTARI, JSON.stringify(sepet));
    } catch {
      console.warn("Sepet kaydedilemedi.");
    }
  }, [sepet, hydrated]);

  useEffect(() => {
    if (!herhangiBirPanelAcik) return;
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oncekiOverflow;
    };
  }, [herhangiBirPanelAcik]);

  useEffect(() => {
    function escapeIleKapat(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuAcik(false);
      setFavorilerAcik(false);
      setSepetAcik(false);
      setSeciliUrun(null);
    }
    window.addEventListener("keydown", escapeIleKapat);
    return () => window.removeEventListener("keydown", escapeIleKapat);
  }, []);

  useEffect(() => {
    if (!bildirim) return;
    const zamanlayici = window.setTimeout(() => setBildirim(""), 2600);
    return () => window.clearTimeout(zamanlayici);
  }, [bildirim]);

  useEffect(() => {
    if (seciliUrun) detayKapatRef.current?.focus();
  }, [seciliUrun]);

  const oneCikanUrunler = useMemo(() => {
    return [...urunler].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  }, [urunler]);

  const filtrelenmisUrunler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    return urunler.filter((urun) => {
      const aramayaUyuyor =
        q === "" ||
        urun.isim.toLocaleLowerCase("tr-TR").includes(q) ||
        urun.aciklama.toLocaleLowerCase("tr-TR").includes(q);
      const kategoriyeUyuyor =
        kategoriId === HEPSI || urun.kategoriId === kategoriId;
      return aramayaUyuyor && kategoriyeUyuyor;
    });
  }, [urunler, arama, kategoriId]);

  const sepettekiUrunler = useMemo(() => {
    return Object.entries(sepet)
      .map(([id, adet]) => {
        const urun = urunler.find((u) => u.id === id);
        return urun ? { urun, adet } : null;
      })
      .filter((x): x is { urun: Urun; adet: number } => x !== null);
  }, [sepet, urunler]);

  const sepetToplami = useMemo(
    () =>
      sepettekiUrunler.reduce(
        (toplam, { urun, adet }) => toplam + urun.fiyat * adet,
        0,
      ),
    [sepettekiUrunler],
  );

  const sepetAdetToplami = useMemo(
    () => Object.values(sepet).reduce((t, a) => t + a, 0),
    [sepet],
  );

  const benzerUrunler = useMemo(() => {
    if (!seciliUrun) return [];
    return urunler
      .filter(
        (u) =>
          u.kategoriId === seciliUrun.kategoriId && u.id !== seciliUrun.id,
      )
      .slice(0, 3);
  }, [urunler, seciliUrun]);

  function bildirimGoster(mesaj: string) {
    setBildirim(mesaj);
  }

  function panelleriKapat() {
    setMenuAcik(false);
    setFavorilerAcik(false);
    setSepetAcik(false);
  }

  function sayfayaGit(yeniSayfa: "ana" | "urunler") {
    setSayfa(yeniSayfa);
    panelleriKapat();
    setArama("");
    setKategoriId(HEPSI);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bolumeGit(id: string) {
    panelleriKapat();
    if (sayfa !== "ana") {
      setSayfa("ana");
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function kategoriSec(id: string) {
    setKategoriId(id);
    setArama("");
    setSayfa("urunler");
    panelleriKapat();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function favoriDegistir(id: string) {
    const zatenFavori = favoriler.includes(id);
    setFavoriler((onceki) => zatenFavori ? onceki.filter((x) => x !== id) : [...onceki, id]);
    bildirimGoster(zatenFavori ? "Favorilerinden kaldırıldı." : "Favorilerine eklendi.");
  }

  function sepeteEkle(id: string) {
    setSepet((onceki) => ({ ...onceki, [id]: (onceki[id] ?? 0) + 1 }));
    const yeniAdet = (sepet[id] ?? 0) + 1;
    bildirimGoster(yeniAdet > 1 ? `Adet ${yeniAdet} olarak güncellendi.` : "Ürün sepete eklendi.");
  }

  function adetArttir(id: string) {
    setSepet((onceki) => ({ ...onceki, [id]: (onceki[id] ?? 0) + 1 }));
  }

  function adetAzalt(id: string) {
    setSepet((onceki) => {
      const mevcut = onceki[id] ?? 0;
      if (mevcut <= 1) {
        const { [id]: _atilan, ...kalan } = onceki;
        return kalan;
      }
      return { ...onceki, [id]: mevcut - 1 };
    });
  }

  function sepettenSil(id: string) {
    setSepet((onceki) => {
      const { [id]: _atilan, ...kalan } = onceki;
      return kalan;
    });
    bildirimGoster("Ürün sepetten kaldırıldı.");
  }

  function sepetiTemizle() {
    if (window.confirm("Sepetteki tüm ürünler silinecek. Emin misiniz?")) {
      setSepet({});
      bildirimGoster("Sepet temizlendi.");
    }
  }

  function favorileriSepeteEkle() {
    if (favoriler.length === 0) return;
    setSepet((onceki) => {
      const yeni = { ...onceki };
      favoriler.forEach((id) => {
        yeni[id] = (yeni[id] ?? 0) + 1;
      });
      return yeni;
    });
    bildirimGoster(`${favoriler.length} favori ürün sepete eklendi.`);
    setFavorilerAcik(false);
    setSepetAcik(true);
  }

  const kategoriFiltreleri = useMemo(
    () => [
      { id: HEPSI, isim: "Tümü" },
      ...kategoriler.map((k) => ({ id: k.id, isim: k.isim })),
    ],
    [kategoriler],
  );

  const urunGridIcerik = !hazir ? (
    <div className="bos-sonuc">Yükleniyor…</div>
  ) : filtrelenmisUrunler.length === 0 ? (
    <div className="bos-sonuc">Aramana uygun ürün bulunamadı.</div>
  ) : (
    filtrelenmisUrunler.map((urun) => (
      <UrunKarti
        key={urun.id}
        urun={urun}
        kategoriIsmi={kategoriBul(urun.kategoriId)?.isim ?? "—"}
        favoriMi={favoriler.includes(urun.id)}
        sepetteAdet={sepet[urun.id] ?? 0}
        onFavori={favoriDegistir}
        onDetay={setSeciliUrun}
        onSepeteEkle={sepeteEkle}
      />
    ))
  );

  return (
    <main className={`zyren ${cormorant.variable} ${manrope.variable}`}>
      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #f5f4f1; color: #171717; }
        button, input, select { font: inherit; }
        button { cursor: pointer; }
        button:focus-visible, input:focus-visible, article:focus-visible {
          outline: 2px solid #b79b65;
          outline-offset: 4px;
        }
        .zyren {
          --gold: #a88a56;
          --gold-dark: #8f733f;
          --text: #171717;
          --muted: #737373;
          min-height: 100vh;
          overflow-x: clip;
          font-family: var(--font-manrope), system-ui, -apple-system, sans-serif;
          background:
            radial-gradient(circle at 12% 5%, rgba(213, 198, 169, 0.28), transparent 27%),
            radial-gradient(circle at 88% 13%, rgba(215, 221, 224, 0.48), transparent 28%),
            linear-gradient(135deg, #f7f6f3 0%, #ffffff 42%, #f0f0ed 100%);
          color: var(--text);
        }
        .zyren button { color: inherit; }

        .duyuru {
          position: relative;
          z-index: 50;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.07);
          background: rgba(255, 255, 255, 0.56);
          backdrop-filter: blur(18px);
          color: #666;
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
        }
        .ust-menu {
          position: sticky;
          top: 0;
          z-index: 50;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 15px 5%;
          border-bottom: 1px solid rgba(25, 25, 25, 0.08);
          background: rgba(255, 255, 255, 0.64);
          backdrop-filter: blur(30px) saturate(140%);
          box-shadow: 0 8px 30px rgba(30, 30, 30, 0.04);
        }
        .ikon-grup { display: flex; align-items: center; gap: 8px; }
        .ikon-dugme {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(25, 25, 25, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.48);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 5px 20px rgba(40, 40, 40, 0.04);
          font-size: 19px;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .ikon-dugme:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 138, 86, 0.38);
          background: rgba(255, 255, 255, 0.85);
        }
        .rozet {
          position: absolute;
          top: -3px;
          right: -3px;
          display: grid;
          place-items: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 50px;
          background: #171717;
          color: #fff !important;
          font-size: 9px;
          font-weight: 700;
        }
        .marka {
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 0;
          background: transparent;
          text-align: center;
          transition: transform 0.25s ease;
        }
        .marka:hover { transform: translateY(-1px); }
        .logo-header {
          width: 110px;
          height: 62px;
          object-fit: contain;
          filter: contrast(1.04) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.08));
        }
        .marka-kucuk {
          display: block;
          margin-top: 2px;
          color: #8f8a82;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 4px;
        }
        .ust-sag { justify-content: flex-end; }

        .hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 690px;
          padding: 90px 24px 100px;
          text-align: center;
          isolation: isolate;
        }
        .hero::before {
          position: absolute;
          z-index: -2;
          top: 5%;
          left: 50%;
          width: min(720px, 90vw);
          height: 590px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.68) 32%, rgba(219, 209, 187, 0.24) 57%, transparent 73%);
          filter: blur(4px);
          transform: translateX(-50%);
          content: "";
        }
        .hero::after {
          position: absolute;
          z-index: -3;
          right: -100px;
          bottom: 0;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: rgba(218, 222, 223, 0.3);
          filter: blur(80px);
          content: "";
        }
        .hero-icerik { width: 100%; max-width: 950px; }
        
        .hero-logo-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: min(560px, 92vw);
          margin: 0 auto 30px;
        }
        .hero-logo {
          position: relative;
          width: 100%;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.12));
        }
        .ust-etiket {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 5px;
          text-transform: uppercase;
        }
        .hero h1 {
          margin: 5px 0 0;
          color: #151515;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(48px, 8vw, 86px);
          font-weight: 500;
          letter-spacing: clamp(5px, 1.2vw, 12px);
          line-height: 1;
        }
        .hero-aciklama {
          max-width: 520px;
          margin: 26px auto 34px;
          color: #707070;
          font-size: 14px;
          line-height: 2;
        }
        .buton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 49px;
          padding: 0 26px;
          border: 1px solid #171717;
          border-radius: 50px;
          background: #171717;
          color: #fff !important;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.7px;
          box-shadow: 0 12px 30px rgba(20, 20, 20, 0.12);
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .buton:hover {
          transform: translateY(-3px);
          background: var(--gold-dark);
          border-color: var(--gold-dark);
          box-shadow: 0 16px 35px rgba(168, 138, 86, 0.2);
        }
        .buton-ikincil {
          border-color: rgba(20, 20, 20, 0.14);
          background: rgba(255, 255, 255, 0.48);
          color: #171717 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 8px 25px rgba(30, 30, 30, 0.04);
        }
        .buton-ikincil:hover {
          border-color: rgba(168, 138, 86, 0.5);
          background: rgba(255, 255, 255, 0.85);
          color: var(--gold-dark) !important;
        }
        .bolum {
          position: relative;
          padding: 100px 5%;
          scroll-margin-top: 90px;
        }
        .bolum-baslik { margin-bottom: 45px; text-align: center; }
        .bolum-baslik span {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 4px;
        }
        .bolum-baslik h2 {
          margin: 12px 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(40px, 5vw, 58px);
          font-weight: 500;
          letter-spacing: 1px;
        }
        .bolum-baslik p {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.9;
        }
        .koleksiyon-ust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          max-width: 1280px;
          margin: 0 auto 25px;
        }
        .arama-alani {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 230px;
          max-width: 370px;
          gap: 10px;
          padding: 0 16px;
          border: 1px solid rgba(20, 20, 20, 0.09);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.56);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 8px 25px rgba(30, 30, 30, 0.035);
          backdrop-filter: blur(20px);
        }
        .arama-alani span { color: #8d8d8d; font-size: 17px; }
        .arama-alani input {
          width: 100%;
          min-height: 45px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #171717;
          font-size: 12px;
        }
        .arama-alani input::placeholder { color: #999; }
        .kategori-listesi { display: flex; flex-wrap: wrap; gap: 7px; }
        .kategori-buton {
          padding: 10px 15px;
          border: 1px solid rgba(20, 20, 20, 0.08);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.42);
          color: #7c7c7c !important;
          font-size: 11px;
          font-weight: 600;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .kategori-buton:hover {
          transform: translateY(-1px);
          border-color: rgba(168, 138, 86, 0.35);
          background: rgba(255, 255, 255, 0.8);
          color: var(--gold-dark) !important;
        }
        .kategori-buton.aktif {
          border-color: #171717;
          background: #171717;
          color: #fff !important;
        }
        .tum-urunler { display: flex; justify-content: center; margin: 0 0 30px; }
        .urun-sayaci {
          max-width: 1280px;
          margin: 0 auto 18px;
          color: #999;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
        }
        .urun-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .urun-kart {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 25px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.43));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 18px 50px rgba(30, 30, 30, 0.055);
          backdrop-filter: blur(25px);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .urun-kart:hover {
          transform: translateY(-7px);
          border-color: rgba(168, 138, 86, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 28px 65px rgba(30, 30, 30, 0.1);
        }
        .urun-gorsel {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 295px;
          overflow: hidden;
          border-bottom: 1px solid rgba(20, 20, 20, 0.06);
          background: radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.96), rgba(238, 237, 232, 0.62) 45%, rgba(218, 217, 211, 0.42) 100%);
        }
        .urun-gorsel::before {
          position: absolute;
          width: 190px;
          height: 190px;
          border: 1px solid rgba(80, 80, 80, 0.07);
          border-radius: 50%;
          box-shadow: 0 0 0 25px rgba(255, 255, 255, 0.16), 0 0 0 50px rgba(255, 255, 255, 0.08);
          content: "";
        }
        .urun-gorsel::after {
          position: absolute;
          top: 20px;
          left: 30px;
          width: 100px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.68);
          filter: blur(15px);
          content: "";
        }
        .urun-sembol {
          position: relative;
          z-index: 1;
          color: #444;
          font-size: 78px;
          filter: drop-shadow(0 12px 12px rgba(0, 0, 0, 0.11));
          transition: transform 0.35s ease, filter 0.35s ease;
        }
        .urun-gorsel-img {
          position: relative;
          z-index: 1;
          max-width: 78%;
          max-height: 82%;
          object-fit: contain;
          border-radius: 12px;
          filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.12));
          transition: transform 0.35s ease;
        }
        .urun-kart:hover .urun-sembol,
        .urun-kart:hover .urun-gorsel-img {
          transform: scale(1.06) translateY(-3px);
        }
        .urun-etiket {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 3;
          padding: 7px 10px;
          border: 1px solid rgba(168, 138, 86, 0.25);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.75);
          color: var(--gold-dark);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          backdrop-filter: blur(10px);
        }
        .urun-etiket.yeni-parla { animation: pulse-gold 2s infinite; }
        @keyframes pulse-gold {
          0% { box-shadow: 0 0 0 0 rgba(168, 138, 86, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(168, 138, 86, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 138, 86, 0); }
        }
        .favori-kalp {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 4;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(30, 30, 30, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.68);
          color: #777;
          font-size: 17px;
          backdrop-filter: blur(15px);
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .favori-kalp:hover { transform: scale(1.08); background: #fff; }
        .favori-kalp.aktif { color: #b45f72 !important; }
        .urun-bilgi { padding: 22px; display: flex; flex-direction: column; flex: 1; }
        .urun-kategori {
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .urun-bilgi h3 {
          margin: 8px 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 29px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .urun-aciklama {
          min-height: 44px;
          margin: 0 0 18px 0;
          color: #7d7d7d;
          font-size: 12px;
          line-height: 1.8;
          flex: 1;
        }
        .urun-alt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(20, 20, 20, 0.07);
          margin-bottom: 12px;
        }
        .urun-fiyat { color: #252525; font-size: 14px; font-weight: 700; }
        .urun-incele {
          border: 0;
          background: transparent;
          color: var(--gold-dark) !important;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .urun-incele:hover { text-decoration: underline; }
        .hizli-sepet-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #171717;
          border-radius: 12px;
          background: #171717;
          color: #fff !important;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: background 0.2s, transform 0.2s;
        }
        .hizli-sepet-btn:hover {
          background: var(--gold-dark);
          border-color: var(--gold-dark);
          transform: translateY(-2px);
        }
        .hizli-sepet-btn.sepette {
          background: rgba(168, 138, 86, 0.15) !important;
          border-color: rgba(168, 138, 86, 0.3) !important;
          color: var(--gold-dark) !important;
        }
        .hizli-sepet-btn.sepette:hover {
          background: rgba(168, 138, 86, 0.25) !important;
          color: var(--gold-dark) !important;
          transform: none;
        }
        .bos-sonuc {
          grid-column: 1 / -1;
          padding: 55px 20px;
          border: 1px dashed rgba(30, 30, 30, 0.13);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.45);
          color: #888;
          text-align: center;
          font-size: 13px;
        }
        .urunler-hero { padding: 90px 5% 55px; text-align: center; }
        .urunler-hero h1 {
          margin: 13px 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(48px, 7vw, 78px);
          font-weight: 500;
          letter-spacing: 5px;
        }
        .urunler-hero p {
          max-width: 540px;
          margin: 0 auto;
          color: #777;
          font-size: 13px;
          line-height: 2;
        }
        .urunler-icerik {
          width: min(1280px, 90%);
          margin: auto;
          padding-bottom: 60px;
        }
        .urunler-icerik .urun-grid { max-width: none; }
        .hikaye {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 70px;
          max-width: 1150px;
          margin: auto;
        }
        .hikaye-gorsel {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 420px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 35px;
          background: radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.95), rgba(222, 220, 213, 0.55));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 30px 70px rgba(30, 30, 30, 0.07);
          backdrop-filter: blur(25px);
        }
        .hikaye-gorsel::before {
          position: absolute;
          width: 260px;
          height: 260px;
          border: 1px solid rgba(50, 50, 50, 0.08);
          border-radius: 50%;
          box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.18), 0 0 0 60px rgba(255, 255, 255, 0.08);
          content: "";
        }
        .hikaye-logo {
          position: relative;
          z-index: 1;
          width: 260px;
          max-width: 65%;
          filter: drop-shadow(0 20px 18px rgba(0, 0, 0, 0.1));
        }
        .hikaye-yazi .ust-etiket { font-size: 10px; }
        .hikaye-yazi h2 {
          margin: 18px 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(40px, 5vw, 60px);
          font-weight: 500;
          line-height: 1;
        }
        .hikaye-yazi p { color: #777; font-size: 13px; line-height: 2.1; }
        .ozellikler {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          max-width: 1100px;
          margin: auto;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.42);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 20px 50px rgba(30, 30, 30, 0.04);
          backdrop-filter: blur(22px);
        }
        .ozellik { padding: 35px 25px; text-align: center; }
        .ozellik + .ozellik { border-left: 1px solid rgba(20, 20, 20, 0.08); }
        .ozellik .sembol { color: var(--gold-dark); font-size: 25px; }
        .ozellik h3 { margin: 13px 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
        .ozellik p { margin: 0; color: #858585; font-size: 12px; line-height: 1.8; }
        .altbilgi {
          padding: 65px 5% 25px;
          border-top: 1px solid rgba(20, 20, 20, 0.07);
          text-align: center;
        }
        .altbilgi-logo { width: 100px; margin-bottom: 10px; }
        .altbilgi-marka { font-family: var(--font-cormorant), Georgia, serif; font-size: 34px; letter-spacing: 4px; }
        .altbilgi p { color: #858585; font-size: 12px; line-height: 2; }
        .altbilgi-linkler {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 22px;
          margin: 25px 0;
        }
        .altbilgi-linkler button { border: 0; background: transparent; color: #777; font-size: 12px; }
        .altbilgi-linkler button:hover { color: var(--gold-dark); }
        .telif {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid rgba(20, 20, 20, 0.07);
          color: #aaa;
          font-size: 10px;
          line-height: 2;
        }
        .arka-plan {
          position: fixed;
          inset: 0;
          z-index: 90;
          width: 100%;
          height: 100%;
          border: 0;
          background: rgba(20, 20, 20, 0.25);
          backdrop-filter: blur(7px);
          cursor: default;
        }
        .yan-panel {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          width: min(440px, 100%);
          height: 100dvh;
          padding: 25px;
          overflow: hidden;
          border-left: 1px solid rgba(255, 255, 255, 0.8);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 242, 0.82));
          box-shadow: -20px 0 70px rgba(30, 30, 30, 0.1);
          backdrop-filter: blur(35px) saturate(140%);
          animation: panelAc 0.28s ease;
        }
        .menu-panel {
          right: auto;
          left: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.8);
          border-left: 0;
          box-shadow: 20px 0 70px rgba(30, 30, 30, 0.1);
        }
        @keyframes panelAc {
          from { opacity: 0; transform: translateX(25px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .panel-ust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.08);
        }
        .panel-ust h2 {
          margin: 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 34px;
          font-weight: 500;
        }
        .panel-icerik {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 20px 0;
          overscroll-behavior: contain;
        }
        .panel-icerik::-webkit-scrollbar { width: 4px; }
        .panel-icerik::-webkit-scrollbar-thumb { border-radius: 20px; background: rgba(30, 30, 30, 0.15); }
        .menu-grup-etiket {
          margin: 23px 0 10px;
          color: var(--gold-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
        }
        .menu-baglantisi {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 17px 0;
          border: 0;
          border-bottom: 1px solid rgba(20, 20, 20, 0.07);
          background: transparent;
          text-align: left;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 26px;
          transition: color 0.2s, padding-left 0.2s;
        }
        .menu-baglantisi span {
          color: var(--gold-dark);
          font-family: var(--font-manrope), system-ui, sans-serif;
          font-size: 13px;
        }
        .menu-baglantisi:hover { padding-left: 6px; color: var(--gold-dark) !important; }
        .panel-alt {
          padding-top: 20px;
          border-top: 1px solid rgba(20, 20, 20, 0.08);
        }
        .panel-alt .buton { width: 100%; }
        .sepet-satiri {
          display: grid;
          grid-template-columns: 65px minmax(0, 1fr);
          gap: 13px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(20, 20, 20, 0.07);
        }
        .sepet-sembol {
          display: grid;
          place-items: center;
          width: 65px;
          height: 70px;
          border-radius: 15px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(224, 223, 218, 0.55));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
          font-size: 32px;
        }
        .sepet-sembol img { width: 80%; height: 80%; object-fit: contain; }
        .sepet-icerik { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .sepet-ust { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .sepet-ust h3 {
          margin: 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.2;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sepet-birim-fiyat { margin: 0; color: #999; font-size: 11px; font-weight: 600; }
        .sepet-alt { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 2px; }
        .sepet-satir-toplam { color: var(--gold-dark); font-size: 13px; font-weight: 700; white-space: nowrap; }
        .adet-kontrol {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(20, 20, 20, 0.1);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.65);
        }
        .adet-kontrol button {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #333 !important;
          font-size: 14px;
          line-height: 1;
          border-radius: 50%;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .adet-kontrol button:hover { background: rgba(168, 138, 86, 0.14); color: var(--gold-dark) !important; }
        .adet-kontrol span { min-width: 24px; text-align: center; font-size: 12px; font-weight: 700; color: #171717; }
        .sil-buton { border: 0; background: transparent; color: #b36c6c !important; font-size: 11px; font-weight: 700; padding: 0; letter-spacing: 0.3px; }
        .sil-buton:hover { text-decoration: underline; }
        .sepet-toplam {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          font-size: 13px;
        }
        .sepet-toplam strong { color: var(--gold-dark); }
        .sepeti-temizle-btn {
          background: transparent;
          border: 0;
          color: #999;
          font-size: 11px;
          text-decoration: underline;
          cursor: pointer;
        }
        .sepeti-temizle-btn:hover { color: #a04040; }
        .bos-panel {
          padding: 50px 10px;
          color: #888;
          text-align: center;
          font-size: 13px;
          line-height: 2;
        }
        .favori-hepsini-ekle {
          width: 100%;
          padding: 14px;
          background: #171717;
          color: #fff !important;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 20px;
          border: none;
        }
        .favori-hepsini-ekle:hover { background: var(--gold-dark); }
        .detay-arka {
          position: fixed;
          inset: 0;
          z-index: 110;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 25px;
          background: rgba(30, 30, 30, 0.27);
          backdrop-filter: blur(14px);
          animation: detayArkaAc 0.2s ease;
        }
        @keyframes detayArkaAc { from { opacity: 0; } to { opacity: 1; } }
        .detay-kart {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: min(950px, 100%);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 30px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 244, 240, 0.84));
          box-shadow: 0 40px 100px rgba(20, 20, 20, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(35px);
          animation: detayAc 0.28s ease;
        }
        @keyframes detayAc {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .detay-gorsel {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 100%;
          padding: 40px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(225, 224, 219, 0.6));
        }
        .detay-gorsel::before {
          position: absolute;
          width: 250px;
          height: 250px;
          border: 1px solid rgba(30, 30, 30, 0.07);
          border-radius: 50%;
          box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.2), 0 0 0 60px rgba(255, 255, 255, 0.1);
          content: "";
        }
        .detay-sembol { position: relative; z-index: 1; font-size: 115px; filter: drop-shadow(0 25px 20px rgba(0, 0, 0, 0.12)); }
        .detay-gorsel-img {
          position: relative;
          z-index: 1;
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 16px;
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15));
        }
        .detay-icerik { align-self: center; padding: 45px; }
        .detay-icerik h2 {
          margin: 12px 0;
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 48px;
          font-weight: 500;
          line-height: 1;
        }
        .detay-icerik p { color: #777; font-size: 13px; line-height: 2; }
        .detay-fiyat { display: block; margin: 26px 0; color: var(--gold-dark); font-size: 21px; }
        .detay-kapat {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 3;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(20, 20, 20, 0.09);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          backdrop-filter: blur(12px);
          transition: transform 0.2s, background 0.2s;
        }
        .detay-kapat:hover { transform: rotate(90deg); background: #fff; }
        .benzer-bolum {
          margin-top: 30px;
          border-top: 1px dashed rgba(20, 20, 20, 0.1);
          padding-top: 20px;
        }
        .benzer-baslik { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #8f8a82; margin-bottom: 12px; }
        .benzer-grid { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
        .benzer-grid::-webkit-scrollbar { height: 4px; }
        .benzer-grid::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px;}
        .benzer-kart {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: 1px solid rgba(20, 20, 20, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .benzer-kart:hover { background: #fff; }
        .benzer-sembol { font-size: 20px; }
        .benzer-sembol img { width: 30px; height: 30px; object-fit: contain; }
        .benzer-isim { font-size: 11px; font-weight: 600; white-space: nowrap; }
        .benzer-fiyat { font-size: 10px; color: var(--gold-dark); font-weight: 700;}
        .bildirim {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 150;
          max-width: calc(100% - 44px);
          padding: 15px 20px;
          border: 1px solid rgba(168, 138, 86, 0.25);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.86);
          color: #303030;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 15px 40px rgba(30, 30, 30, 0.12);
          backdrop-filter: blur(20px);
          animation: bildirimAc 0.25s ease;
        }
        @keyframes bildirimAc {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .urun-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
          .hikaye { gap: 35px; }
          .detay-kart { grid-template-columns: 1fr; max-width: 500px; }
          .detay-gorsel { min-height: 300px; padding: 20px; }
        }

        @media (max-width: 620px) {
          .duyuru { padding: 10px 12px; font-size: 9px; letter-spacing: 2px; }
          .ust-menu { padding: 12px 4%; }
          .ikon-dugme { width: 44px; height: 44px; font-size: 20px; }
          .logo-header { width: 100px; height: 56px; }
          .marka-kucuk { display: none; }
          .hero { min-height: 550px; padding: 60px 18px 80px; }
          .hero-logo-wrap { margin-bottom: 22px; }
          .hero h1 { font-size: clamp(42px, 12vw, 65px); letter-spacing: 4px; }
          .hero-aciklama { font-size: 13px; margin: 20px auto 30px; }
          .bolum { padding: 70px 4%; }
          .koleksiyon-ust { align-items: stretch; }
          .arama-alani { max-width: none; min-height: 48px; }
          .arama-alani input { font-size: 16px; } 
          .kategori-listesi { width: 100%; }
          .kategori-buton { flex: 1; min-width: max-content; padding: 10px 14px; font-size: 11px; }
          .urun-grid { grid-template-columns: 1fr; gap: 16px; }
          .urun-kart { flex-direction: row; height: auto; min-height: 150px; } 
          .urun-gorsel { width: 130px; min-height: 100%; border-bottom: none; border-right: 1px solid rgba(20, 20, 20, 0.06); flex-shrink: 0; }
          .urun-gorsel::before { width: 90px; height: 90px; box-shadow: 0 0 0 15px rgba(255,255,255,0.16), 0 0 0 30px rgba(255,255,255,0.08); }
          .urun-sembol { font-size: 45px; }
          .urun-bilgi { padding: 12px; flex: 1; justify-content: center; }
          .urun-bilgi h3 { font-size: 18px; margin: 4px 0; }
          .urun-aciklama { display: none; } 
          .urun-alt { padding-top: 8px; margin-bottom: 8px; border-top: none; }
          .urun-fiyat { font-size: 13px; }
          .urun-incele { font-size: 10px; }
          .hizli-sepet-btn { padding: 8px; font-size: 10px; margin-top: 4px; color: #fff !important; }
          .favori-kalp { top: 8px; right: 8px; width: 32px; height: 32px; font-size: 14px; }
          .urun-etiket { top: 8px; left: 8px; padding: 4px 6px; font-size: 8px; }
          .urunler-hero { padding: 50px 5% 30px; }
          .urunler-hero h1 { font-size: 38px; letter-spacing: 2px; }
          .urunler-icerik { width: 92%; }
          .hikaye { grid-template-columns: 1fr; gap: 30px; }
          .hikaye-gorsel { min-height: 290px; }
          .hikaye-logo { width: 200px; }
          .hikaye-yazi h2 { font-size: 38px; }
          .ozellikler { grid-template-columns: 1fr; }
          .ozellik + .ozellik { border-top: 1px solid rgba(20, 20, 20, 0.08); border-left: 0; }
          .yan-panel { width: 100%; padding: 20px; }
          .detay-arka { padding: 0; align-items: flex-end; }
          .detay-kart { max-height: 92vh; overflow-y: auto; border-radius: 24px 24px 0 0; }
          .detay-gorsel { min-height: 220px; }
          .detay-icerik { padding: 25px; }
          .detay-icerik h2 { font-size: 34px; }
          .detay-kapat { position: fixed; top: 15px; right: 15px; background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          .bildirim { right: 16px; bottom: 16px; left: 16px; text-align: center; padding: 14px 20px; font-size: 13px; }
        }
      `}</style>

      <div className="duyuru">ZAMANSIZ TASARIM · MODERN ZARAFET · ZYREN VERSÉ</div>

      <header className="ust-menu">
        <div className="ikon-grup">
          <button type="button" className="ikon-dugme" aria-label="Menüyü aç" onClick={() => { setMenuAcik(true); setFavorilerAcik(false); setSepetAcik(false); }}>☰</button>
        </div>

        <button type="button" className="marka" aria-label="Ana sayfaya git" onClick={() => sayfayaGit("ana")}>
          <img className="logo-header" src="/zyren-logo.png" alt="ZYREN VERSÉ" decoding="async" />
          <span className="marka-kucuk">TIMELESS ELEGANCE</span>
        </button>

        <div className="ikon-grup ust-sag">
          <button type="button" className="ikon-dugme" aria-label={`Favoriler (${favoriler.length})`} onClick={() => { setFavorilerAcik(true); setSepetAcik(false); setMenuAcik(false); }}>
            ♡ {favoriler.length > 0 && <span className="rozet" aria-hidden="true">{favoriler.length}</span>}
          </button>
          <button type="button" className="ikon-dugme" aria-label={`Sepet (${sepetAdetToplami} ürün)`} onClick={() => { setSepetAcik(true); setFavorilerAcik(false); setMenuAcik(false); }}>
            🛒 {sepetAdetToplami > 0 && <span className="rozet" aria-hidden="true">{sepetAdetToplami}</span>}
          </button>
        </div>
      </header>

      {sayfa === "ana" ? (
        <>
          <section className="hero" id="ana-sayfa">
            <div className="hero-icerik">
              <div className="ust-etiket">ZARAFETİN YENİ YORUMU</div>
              <div className="hero-logo-wrap">
                <img className="hero-logo" src="/zyren-logo.png" alt="ZYREN VERSÉ kuğu logosu" />
              </div>
              <h1>ZYREN VERSÉ</h1>
              <p className="hero-aciklama">Her detayda zarafet, her tasarımda karakter. Kendine özgü stilini zamansız parçalarla keşfet.</p>
              <button type="button" className="buton" onClick={() => bolumeGit("koleksiyon")}>
                KOLEKSİYONU KEŞFET <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>

          <section className="bolum" id="koleksiyon">
            <div className="bolum-baslik">
              <span>ÖZENLE SEÇİLDİ</span>
              <h2>Öne Çıkan Koleksiyon</h2>
              <p>Günlük stilinden özel anlarına, sana eşlik edecek tasarımlar.</p>
            </div>

            <div className="urun-grid">
              {!hazir ? (
                <div className="bos-sonuc">Yükleniyor…</div>
              ) : oneCikanUrunler.length === 0 ? (
                <div className="bos-sonuc">Henüz ürün bulunmuyor.</div>
              ) : (
                oneCikanUrunler.map((urun) => (
                  <UrunKarti key={urun.id} urun={urun} kategoriIsmi={kategoriBul(urun.kategoriId)?.isim ?? "—"} favoriMi={favoriler.includes(urun.id)} sepetteAdet={sepet[urun.id] ?? 0} onFavori={favoriDegistir} onDetay={setSeciliUrun} onSepeteEkle={sepeteEkle} />
                ))
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
              <button type="button" className="buton" style={{ padding: "16px 40px", fontSize: "13px", width: "100%", maxWidth: "350px" }} onClick={() => sayfayaGit("urunler")}>
                TÜM KOLEKSİYONU KEŞFET <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>

          <section className="bolum" id="hikayemiz">
            <div className="hikaye">
              <div className="hikaye-gorsel">
                <img className="hikaye-logo" src="/zyren-logo.png" alt="ZYREN VERSÉ kuğu logosu" loading="lazy" decoding="async" />
              </div>
              <div className="hikaye-yazi">
                <span className="ust-etiket">BİZİM HİKÂYEMİZ</span>
                <h2>Zarafet,<br />bir duruştur.</h2>
                <p>ZYREN VERSÉ, kişisel tarzın özgünlüğünü ve zamansız tasarımın güzelliğini bir araya getirme fikrinden doğdu.</p>
                <p>Kuğunun zarif siluetinden ilham alan marka kimliğimiz; sadeliği, karakteri ve kendine özgü olmayı temsil ediyor.</p>
                <button type="button" className="buton buton-ikincil" onClick={() => sayfayaGit("urunler")}>
                  TASARIMLARI KEŞFET <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </section>

          <section className="bolum">
            <div className="ozellikler">
              <div className="ozellik"><div className="sembol" aria-hidden="true">✧</div><h3>ZAMANSIZ TASARIM</h3><p>Geçici trendlerden bağımsız, kendine özgü çizgiler.</p></div>
              <div className="ozellik"><div className="sembol" aria-hidden="true">◇</div><h3>DETAYLARA ÖZEN</h3><p>Her parçanın görünümünde sadelik ve uyum.</p></div>
              <div className="ozellik"><div className="sembol" aria-hidden="true">🦢</div><h3>ÖZGÜN KARAKTER</h3><p>Stilini yansıtan, kişisel bir dokunuş.</p></div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="urunler-hero">
            <div className="ust-etiket">ZYREN VERSÉ KOLEKSİYONU</div>
            <h1>Tüm Ürünler</h1>
            <p>Kendine özgü tarzını keşfet. Zamansız tasarımları incele, favorilerini seç ve sana hitap eden parçaları bul.</p>
          </section>

          <section className="urunler-icerik">
            <div className="koleksiyon-ust">
              <label className="arama-alani">
                <span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Ürün adıyla ara..." value={arama} onChange={(e) => setArama(e.target.value)} aria-label="Ürün adıyla ara" />
              </label>

              <div className="kategori-listesi">
                {kategoriFiltreleri.map((k) => (
                  <button type="button" key={k.id} className={`kategori-buton ${kategoriId === k.id ? "aktif" : ""}`} aria-pressed={kategoriId === k.id} onClick={() => setKategoriId(k.id)}>
                    {k.isim}
                  </button>
                ))}
              </div>
            </div>

            <div className="urun-sayaci">{filtrelenmisUrunler.length} ÜRÜN GÖSTERİLİYOR</div>
            <div className="urun-grid">{urunGridIcerik}</div>
          </section>
        </>
      )}

      <footer className="altbilgi" id="iletisim">
        <img className="altbilgi-logo" src="/zyren-logo.png" alt="ZYREN VERSÉ" loading="lazy" decoding="async" />
        <div className="altbilgi-marka">ZYREN VERSÉ</div>
        <p>Timeless elegance. Your own expression.</p>

        <div className="altbilgi-linkler">
          <button type="button" onClick={() => sayfayaGit("ana")}>Ana Sayfa</button>
          <button type="button" onClick={() => sayfayaGit("urunler")}>Tüm Ürünler</button>
          <button type="button" onClick={() => bolumeGit("hikayemiz")}>Hikâyemiz</button>
          <button type="button" onClick={() => bildirimGoster("Bu demo sürümünde iletişim formu henüz aktif değil.")}>İletişim</button>
        </div>

        <div className="telif">
          © 2026 ZYREN VERSÉ. Tüm hakları saklıdır.<br />
          Bu site geliştirme ve tanıtım amaçlı bir demo projesidir.
        </div>
      </footer>

      {(menuAcik || favorilerAcik || sepetAcik) && (
        <>
          <button type="button" className="arka-plan" aria-label="Paneli kapat" onClick={panelleriKapat} />

          <aside className={`yan-panel ${menuAcik ? "menu-panel" : ""}`} aria-label={menuAcik ? "Keşfet menüsü" : favorilerAcik ? "Favoriler" : "Sepet"}>
            <div className="panel-ust">
              <h2>{menuAcik ? "Keşfet" : favorilerAcik ? "Favorilerim" : "Alışveriş Sepetim"}</h2>
              <button type="button" className="ikon-dugme" aria-label="Kapat" onClick={panelleriKapat}>×</button>
            </div>

            {menuAcik && (
              <div className="panel-icerik">
                <div className="menu-grup-etiket">KEŞFET</div>
                <button type="button" className="menu-baglantisi" onClick={() => sayfayaGit("ana")}>Ana Sayfa <span aria-hidden="true">↗</span></button>
                <button type="button" className="menu-baglantisi" onClick={() => bolumeGit("koleksiyon")}>Koleksiyon <span aria-hidden="true">↗</span></button>
                <button type="button" className="menu-baglantisi" onClick={() => sayfayaGit("urunler")}>Tüm Ürünler <span aria-hidden="true">↗</span></button>

                <div className="menu-grup-etiket">KATEGORİLER</div>
                {kategoriler.map((k) => (
                  <button type="button" key={k.id} className="menu-baglantisi" onClick={() => kategoriSec(k.id)}>{k.isim} <span aria-hidden="true">↗</span></button>
                ))}
                <button type="button" className="menu-baglantisi" onClick={() => kategoriSec(HEPSI)}>Tüm kategoriler <span aria-hidden="true">↗</span></button>

                <div className="menu-grup-etiket">ZYREN VERSÉ</div>
                <button type="button" className="menu-baglantisi" onClick={() => bolumeGit("hikayemiz")}>Hikâyemiz <span aria-hidden="true">↗</span></button>
                <button type="button" className="menu-baglantisi" onClick={() => bolumeGit("iletisim")}>İletişim <span aria-hidden="true">↗</span></button>
              </div>
            )}

            {favorilerAcik && (
              <div className="panel-icerik">
                {favoriler.length === 0 ? (
                  <div className="bos-panel">
                    <div style={{ fontSize: 40 }} aria-hidden="true">♡</div>
                    Henüz favorilerine ürün eklememişsin.
                  </div>
                ) : (
                  <>
                    {urunler.filter((u) => favoriler.includes(u.id)).map((urun) => (
                      <div className="sepet-satiri" key={urun.id}>
                        <div className="sepet-sembol" aria-hidden="true">
                          {urun.gorselUrl ? <img src={urun.gorselUrl} alt="" /> : urun.sembol}
                        </div>
                        <div className="sepet-icerik">
                          <div className="sepet-ust">
                            <h3>{urun.isim}</h3>
                            <button type="button" className="sil-buton" onClick={() => favoriDegistir(urun.id)}>Kaldır</button>
                          </div>
                          <p className="sepet-birim-fiyat">{PARA(urun.fiyat)}</p>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="favori-hepsini-ekle" onClick={favorileriSepeteEkle}>TÜMÜNÜ SEPETE EKLE ({favoriler.length})</button>
                  </>
                )}
              </div>
            )}

            {sepetAcik && (
              <>
                <div className="panel-icerik">
                  {sepettekiUrunler.length === 0 ? (
                    <div className="bos-panel">
                      <div style={{ fontSize: 40 }} aria-hidden="true">🛒</div>
                      Sepetin şimdilik boş.
                    </div>
                  ) : (
                    sepettekiUrunler.map(({ urun, adet }) => (
                      <div className="sepet-satiri" key={urun.id}>
                        <div className="sepet-sembol" aria-hidden="true">
                          {urun.gorselUrl ? <img src={urun.gorselUrl} alt="" /> : urun.sembol}
                        </div>
                        <div className="sepet-icerik">
                          <div className="sepet-ust">
                            <h3>{urun.isim}</h3>
                            <button type="button" className="sil-buton" onClick={() => sepettenSil(urun.id)}>Sil</button>
                          </div>
                          <p className="sepet-birim-fiyat">{PARA(urun.fiyat)} / adet</p>
                          <div className="sepet-alt">
                            <div className="adet-kontrol" role="group">
                              <button type="button" onClick={() => adetAzalt(urun.id)}>−</button>
                              <span aria-live="polite">{adet}</span>
                              <button type="button" onClick={() => adetArttir(urun.id)}>+</button>
                            </div>
                            <strong className="sepet-satir-toplam">{PARA(urun.fiyat * adet)}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="panel-alt">
                  <div className="sepet-toplam">
                    <div>
                      <span>Toplam ({sepetAdetToplami} ürün)</span>
                      {sepetAdetToplami > 0 && (
                        <button type="button" className="sepeti-temizle-btn" onClick={sepetiTemizle} style={{ display: "block", marginTop: 4 }}>Sepeti Temizle</button>
                      )}
                    </div>
                    <strong>{PARA(sepetToplami)}</strong>
                  </div>
                  <button type="button" className="buton" onClick={() => bildirimGoster("Bu demo sürümünde gerçek ödeme veya sipariş oluşturulmaz.")}>DEMO ÖDEME <span aria-hidden="true">↗</span></button>
                  <p style={{ color: "#888", fontSize: 10, lineHeight: 1.8, textAlign: "center" }}>Bu sepet test amaçlıdır. Gerçek sipariş veya ödeme yapılmaz.</p>
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {seciliUrun && (
        <div className="detay-arka" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSeciliUrun(null); }}>
          <article className="detay-kart" role="dialog" aria-modal="true" aria-label={`${seciliUrun.isim} ürün detayı`}>
            <button ref={detayKapatRef} type="button" className="detay-kapat" aria-label="Ürün detayını kapat" onClick={() => setSeciliUrun(null)}>×</button>
            <div className="detay-gorsel">
              {seciliUrun.gorselUrl ? (
                <img className="detay-gorsel-img" src={seciliUrun.gorselUrl} alt={seciliUrun.isim} />
              ) : (
                <span className="detay-sembol" aria-hidden="true">{seciliUrun.sembol}</span>
              )}
            </div>
            <div className="detay-icerik">
              <span className="urun-kategori">{kategoriBul(seciliUrun.kategoriId)?.isim ?? "—"}</span>
              <h2>{seciliUrun.isim}</h2>
              <p>{seciliUrun.aciklama}</p>
              <strong className="detay-fiyat">{PARA(seciliUrun.fiyat)}</strong>

              <button type="button" className="buton" style={{ width: "100%", marginBottom: 10 }} onClick={() => sepeteEkle(seciliUrun.id)}>
                {sepet[seciliUrun.id] ? `SEPETE EKLE (+1) · SEPETTE ${sepet[seciliUrun.id]} ADET` : "SEPETE EKLE"} <span aria-hidden="true">↗</span>
              </button>

              <button type="button" className="buton buton-ikincil" style={{ width: "100%" }} onClick={() => favoriDegistir(seciliUrun.id)}>
                {favoriler.includes(seciliUrun.id) ? "♥ FAVORİLERDEN ÇIKAR" : "♡ FAVORİLERE EKLE"}
              </button>

              {benzerUrunler.length > 0 && (
                <div className="benzer-bolum">
                  <div className="benzer-baslik">BUNLARI DA SEVEBİLİRSİN</div>
                  <div className="benzer-grid">
                    {benzerUrunler.map((u) => (
                      <div key={u.id} className="benzer-kart" onClick={() => setSeciliUrun(u)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSeciliUrun(u); } }}>
                        <div className="benzer-sembol">{u.gorselUrl ? <img src={u.gorselUrl} alt="" /> : u.sembol}</div>
                        <div>
                          <div className="benzer-isim">{u.isim}</div>
                          <div className="benzer-fiyat">{PARA(u.fiyat)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {bildirim && <div className="bildirim" role="status" aria-live="polite">{bildirim}</div>}
    </main>
  );
}