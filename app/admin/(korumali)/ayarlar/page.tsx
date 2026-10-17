"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useStore } from "@/contexts/StoreContext";

export default function AdminAyarlar() {
  const { urunler, kategoriler, fabrikaAyarlarinaDon, hazir } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [islemde, setIslemde] = useState(false);
  const [bildirim, setBildirim] = useState("");

  function toast(mesaj: string) {
    setBildirim(mesaj);
    window.setTimeout(() => setBildirim(""), 3000);
  }

  /* ---------- YEDEK AL (EXPORT) ---------- */
  function yedekAl() {
    const veri = { urunler, kategoriler };
    const jsonString = JSON.stringify(veri, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyren-yedek-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast("Yedek dosyası indirildi.");
  }

  /* ---------- YEDEKTEN YÜKLE (IMPORT) ---------- */
  async function dosyaSec(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Dikkat! Mevcut tüm veriler silinip, yedekteki veriler yüklenecek. Onaylıyor musun?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIslemde(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const icerik = event.target?.result as string;
        const parsed = JSON.parse(icerik);
        
        if (!parsed.urunler || !parsed.kategoriler) {
          throw new Error("Geçersiz dosya formatı. Lütfen doğru bir yedek dosyası seçin.");
        }

        const res = await fetch("/api/ice-aktar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: icerik,
        });

        if (!res.ok) throw new Error("Sunucu hatası.");
        
        toast("Yedek başarıyla yüklendi. Sayfa yenileniyor...");
        setTimeout(() => window.location.reload(), 1500);
        
      } catch (err) {
        alert(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
        setIslemde(false);
      }
    };
    reader.readAsText(file);
  }

  /* ---------- SIFIRLA (RESET) ---------- */
  async function sifirla() {
    if (!window.confirm("TÜM VERİLER SİLİNECEK ve varsayılan ayarlara dönülecek. Emin misin?")) return;
    if (!window.confirm("Son kez soruyorum: Bu işlem geri alınamaz! Onaylıyor musun?")) return;

    setIslemde(true);
    try {
      await fabrikaAyarlarinaDon();
      toast("Fabrika ayarlarına dönüldü. Sayfa yenileniyor...");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      alert("Sıfırlama başarısız oldu.");
      setIslemde(false);
    }
  }

  if (!hazir) {
    return <div style={{ padding: "60px 20px", textAlign: "center", color: "#999" }}>YÜKLENİYOR…</div>;
  }

  return (
    <>
      <style jsx>{`
        .ayar-ust {
          margin-bottom: 30px;
        }
        .etiket {
          margin: 0 0 4px;
          color: #8f8a72;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .baslik {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 26px;
          font-weight: 500;
        }

        .kartlar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .kart {
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.65);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 15px 40px rgba(30, 30, 30, 0.05);
          display: flex;
          flex-direction: column;
        }
        .kart.genis {
          grid-column: 1 / -1;
        }

        .kart h3 {
          margin: 0 0 8px;
          font-family: Georgia, serif;
          font-size: 20px;
          font-weight: 600;
        }
        .kart p {
          margin: 0 0 20px;
          color: #666;
          font-size: 13px;
          line-height: 1.6;
          flex: 1;
        }

        .istatistik {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
        }
        .istatistik-item {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .istatistik-sayi {
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: 700;
          color: #8f733f;
          line-height: 1;
        }
        .istatistik-yazi {
          color: #888;
          font-size: 12px;
          font-weight: 600;
        }

        .btn {
          padding: 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          text-align: center;
          border: none;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn.primary {
          background: #171717;
          color: #fff;
        }
        .btn.secondary {
          border: 1px solid rgba(20, 20, 20, 0.15);
          background: transparent;
          color: #444;
        }
        .btn.danger {
          background: #a04040;
          color: #fff;
        }

        .toast {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 250;
          padding: 14px 22px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.98);
          color: #303030;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 15px 40px rgba(30, 30, 30, 0.15);
        }

        @media (max-width: 640px) {
          .kartlar { grid-template-columns: 1fr; }
          .istatistik { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <div className="ayar-ust">
        <p className="etiket">YÖNETİM · AYARLAR</p>
        <h2 className="baslik">Sistem Ayarları</h2>
      </div>

      <div className="kartlar">
        
        {/* VERİ ÖZETİ */}
        <div className="kart genis">
          <h3>Veritabanı Özeti</h3>
          <p>Şu an veritabanınızda bulunan toplam kayıt sayısı.</p>
          <div className="istatistik">
            <div className="istatistik-item">
              <span className="istatistik-sayi">{urunler.length}</span>
              <span className="istatistik-yazi">ÜRÜN</span>
            </div>
            <div className="istatistik-item">
              <span className="istatistik-sayi">{kategoriler.length}</span>
              <span className="istatistik-yazi">KATEGORİ</span>
            </div>
          </div>
        </div>

        {/* YEDEKLE */}
        <div className="kart">
          <h3>Yedek Al</h3>
          <p>Tüm ürün ve kategorileri bir JSON dosyası olarak bilgisayarınıza indirin. Bu dosyayı saklayarak ileride geri yükleyebilirsiniz.</p>
          <button type="button" className="btn primary" onClick={yedekAl} disabled={islemde}>
            JSON OLARAK İNDİR ↓
          </button>
        </div>

        {/* YÜKLE */}
        <div className="kart">
          <h3>Yedekten Yükle</h3>
          <p>Daha önceden indirdiğiniz bir JSON yedek dosyasını yükleyin. <strong>Dikkat:</strong> Mevcut veriler silinir.</p>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={dosyaSec} 
            style={{ display: "none" }} 
          />
          <button 
            type="button" 
            className="btn secondary" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={islemde}
          >
            DOSYA SEÇ VE YÜKLE ↑
          </button>
        </div>

        {/* SIFIRLA */}
        <div className="kart genis" style={{ border: "1px solid rgba(180,90,90,0.3)", background: "rgba(255,245,245,0.5)" }}>
          <h3 style={{ color: "#a04040" }}>Tehlikeli Bölge</h3>
          <p>Sistemdeki tüm ürün ve kategorileri kalıcı olarak siler. Sistem varsayılan (fabrika) verilerine döner. Bu işlem geri alınamaz.</p>
          <button type="button" className="btn danger" onClick={sifirla} disabled={islemde}>
            FABRİKA AYARLARINA DÖN
          </button>
        </div>

      </div>

      {bildirim && (
        <div className="toast" role="status" aria-live="polite">
          {bildirim}
        </div>
      )}
    </>
  );
}