"use client";

import { useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { useStore } from "@/contexts/StoreContext";

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (n: number) => TRY_FORMATTER.format(n);

type FormDurum = {
  acik: boolean;
  duzenlenenId: string | null;
  isim: string;
  kategoriId: string;
  fiyat: string;
  sembol: string;
  etiket: string;
  aciklama: string;
  gorselUrl: string;
  stok: string; // YENİ
};

const BOS_FORM: FormDurum = {
  acik: false,
  duzenlenenId: null,
  isim: "",
  kategoriId: "",
  fiyat: "",
  sembol: "",
  etiket: "",
  aciklama: "",
  gorselUrl: "",
  stok: "10", // YENİ: Varsayılan stok 10
};

export default function AdminUrunler() {
  const {
    urunler,
    kategoriler,
    urunEkle,
    urunGuncelle,
    urunSil,
    kategoriBul,
    hazir,
  } = useStore();

  const [form, setForm] = useState<FormDurum>(BOS_FORM);
  const [formHata, setFormHata] = useState("");
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [bildirim, setBildirim] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const [arama, setArama] = useState("");
  const [filtreKategori, setFiltreKategori] = useState<string>("hepsi");

  const listelenenUrunler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    return urunler
      .filter((u) => {
        const aramaUygun = q === "" || u.isim.toLocaleLowerCase("tr-TR").includes(q);
        const kategoriUygun = filtreKategori === "hepsi" || u.kategoriId === filtreKategori;
        return aramaUygun && kategoriUygun;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [urunler, arama, filtreKategori]);

  const silinecekUrun = silinecekId ? urunler.find((u) => u.id === silinecekId) : null;

  /* ---------- YARDIMCILAR ---------- */
  function toast(mesaj: string) {
    setBildirim(mesaj);
    window.setTimeout(() => setBildirim(""), 2600);
  }

  function yeniAc() {
    setForm({ ...BOS_FORM, acik: true, kategoriId: kategoriler[0]?.id ?? "" });
    setFormHata("");
  }

  function duzenleAc(u: (typeof urunler)[number]) {
    setForm({
      acik: true,
      duzenlenenId: u.id,
      isim: u.isim,
      kategoriId: u.kategoriId,
      fiyat: String(u.fiyat),
      sembol: u.sembol,
      etiket: u.etiket ?? "",
      aciklama: u.aciklama,
      gorselUrl: u.gorselUrl ?? "",
      stok: String(u.stok ?? 0), // YENİ
    });
    setFormHata("");
  }

  function formKapat() {
    setForm(BOS_FORM);
    setFormHata("");
  }

  /* ---------- RESİM YÜKLEME VE SIKIŞTIRMA ---------- */
  async function resimYukle(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setYukleniyor(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = (err) => reject(err);
        };
      });

      const res = await fetch("/api/yukle", {
        method: "POST",
        body: (() => {
          const formData = new FormData();
          formData.append("file", file);
          return formData;
        })(),
      });

      if (!res.ok) throw new Error("Yükleme başarısız oldu");
      const data = await res.json();

      setForm((f) => ({ ...f, gorselUrl: data.url }));
      toast("Görsel başarıyla yüklendi.");
    } catch (error) {
      console.error(error);
      setFormHata("Görsel yüklenirken bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  }

  /* ---------- KAYDET ---------- */
  function kaydet(e: FormEvent) {
    e.preventDefault();

    const isim = form.isim.trim();
    const aciklama = form.aciklama.trim();
    const sembol = form.sembol.trim();
    const etiket = form.etiket.trim();
    const fiyatNum = parseInt(form.fiyat, 10);
    const stokNum = parseInt(form.stok, 10); // YENİ

    if (isim.length < 2) return setFormHata("Ürün adı en az 2 karakter olmalı.");
    if (!form.kategoriId) return setFormHata("Lütfen bir kategori seçin.");
    if (isNaN(fiyatNum) || fiyatNum <= 0) return setFormHata("Geçerli bir fiyat girin.");
    if (isNaN(stokNum) || stokNum < 0) return setFormHata("Geçerli bir stok adedi girin (0 veya üzeri)."); // YENİ
    if (sembol.length === 0) return setFormHata("Lütfen bir emoji sembol girin.");
    if (aciklama.length < 5) return setFormHata("Açıklama en az 5 karakter olmalı.");

    if (form.duzenlenenId) {
      urunGuncelle(form.duzenlenenId, {
        isim,
        kategoriId: form.kategoriId,
        fiyat: fiyatNum,
        sembol,
        etiket: etiket || undefined,
        aciklama,
        gorselUrl: form.gorselUrl || undefined,
        stok: stokNum, // YENİ
      });
      toast("Ürün güncellendi.");
    } else {
      urunEkle({
        isim,
        kategoriId: form.kategoriId,
        fiyat: fiyatNum,
        sembol,
        etiket: etiket || undefined,
        aciklama,
        gorselUrl: form.gorselUrl || undefined,
        stok: stokNum, // YENİ
      });
      toast("Ürün eklendi.");
    }

    formKapat();
  }

  /* ---------- SİL ---------- */
  function silOnayla() {
    if (!silinecekId) return;
    urunSil(silinecekId);
    toast("Ürün silindi.");
    setSilinecekId(null);
  }

  if (!hazir) {
    return <div style={{ padding: "60px 20px", textAlign: "center", color: "#999" }}>YÜKLENİYOR…</div>;
  }

  return (
    <>
      <style jsx>{`
        .ust-alan {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
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
        .ekle-btn {
          padding: 12px 22px;
          border: 1px solid #171717;
          border-radius: 50px;
          background: #171717;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          cursor: pointer;
        }
        .filtre-alani {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .arama-input, .kategori-select {
          padding: 10px 16px;
          border: 1px solid rgba(20, 20, 20, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          outline: none;
        }
        .arama-input { flex: 1; min-width: 200px; }
        .kategori-select { min-width: 150px; }
        .liste-kutu {
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.65);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 15px 40px rgba(30, 30, 30, 0.05);
        }
        .satir {
          display: grid;
          grid-template-columns: 60px 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.06);
        }
        .satir:last-child { border-bottom: none; }
        .gorsel {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(145deg, #ffffff, #f0eeea);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
          font-size: 24px;
          overflow: hidden;
        }
        .gorsel img { width: 100%; height: 100%; object-fit: cover; }
        .bilgi { min-width: 0; }
        .isim {
          margin: 0 0 4px;
          font-family: Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
        }
        .kategori { margin: 0; color: #999; font-size: 11px; font-weight: 600; }
        
        /* STOK ETİKETİ */
        .stok-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 8px;
          white-space: nowrap;
        }
        .stok-badge.var { background: #e8f5e9; color: #2e7d32; }
        .stok-badge.yok { background: #ffebee; color: #c62828; }

        .fiyat { font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #8f733f; }
        .islemler { display: flex; gap: 6px; }
        .btn { padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; cursor: pointer; }
        .btn.duzenle { border: 1px solid rgba(20, 20, 20, 0.1); background: rgba(255, 255, 255, 0.8); color: #444; }
        .btn.sil { border: 1px solid rgba(180, 90, 90, 0.25); background: rgba(255, 245, 245, 0.7); color: #a04040; }

        /* MODAL */
        .modal-arka {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(30, 30, 30, 0.4);
          backdrop-filter: blur(10px);
        }
        .modal-kart {
          width: 100%;
          max-width: 520px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 40px 90px rgba(20, 20, 20, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-baslik { margin: 0 0 22px; font-family: Georgia, serif; font-size: 24px; font-weight: 500; }
        .form-grup { margin-bottom: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-etiket { display: block; margin-bottom: 6px; color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(20, 20, 20, 0.12);
          border-radius: 12px;
          background: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }
        .form-textarea { min-height: 80px; resize: vertical; }
        
        /* RESİM YÜKLEME ALANI */
        .resim-alani {
          border: 2px dashed rgba(20, 20, 20, 0.15);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          background: #faf9f7;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .resim-alani:hover { border-color: #8f733f; background: #f5f2ea; }
        .resim-onizleme { width: 100%; height: 160px; object-fit: contain; display: block; margin: 0 auto; }
        .resim-sil-btn {
          position: absolute; top: 8px; right: 8px;
          background: #fff; border: 1px solid #ddd; border-radius: 50%;
          width: 28px; height: 28px; cursor: pointer; font-size: 12px;
          display: grid; place-items: center;
        }
        
        .form-hata { margin-top: 12px; padding: 10px 14px; border: 1px solid rgba(180, 90, 90, 0.3); border-radius: 10px; background: rgba(255, 240, 240, 0.9); color: #a04040; font-size: 12px; }
        .modal-butonlar { display: flex; gap: 10px; margin-top: 24px; }
        .modal-btn { flex: 1; padding: 14px; border-radius: 50px; font-size: 12px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .modal-btn.iptal { border: 1px solid rgba(20, 20, 20, 0.15); background: transparent; color: #444; }
        .modal-btn.olustur { border: 1px solid #171717; background: #171717; color: #fff; }
        .modal-btn.sil { border: 1px solid #a04040; background: #a04040; color: #fff; }
        .sil-uyari { font-size: 38px; text-align: center; margin-bottom: 8px; }
        .sil-baslik { margin: 0 0 12px; text-align: center; font-family: Georgia, serif; font-size: 22px; font-weight: 500; }
        .sil-aciklama { margin: 0 0 8px; color: #666; font-size: 13px; text-align: center; line-height: 1.7; }

        .toast {
          position: fixed; right: 22px; bottom: 22px; z-index: 250;
          padding: 14px 22px; border-radius: 50px;
          background: rgba(255, 255, 255, 0.98); color: #303030;
          font-size: 12px; font-weight: 600;
          box-shadow: 0 15px 40px rgba(30, 30, 30, 0.15);
        }

        @media (max-width: 640px) {
          .satir { grid-template-columns: 48px 1fr; gap: 12px; padding: 14px 16px; row-gap: 8px; }
          .gorsel { width: 42px; height: 42px; font-size: 20px; grid-row: span 2; }
          .isim { font-size: 16px; flex-direction: column; align-items: flex-start; gap: 4px; }
          .stok-badge { margin-left: 0; }
          .fiyat { grid-column: 2; font-size: 14px; }
          .islemler { grid-column: 2; margin-top: 4px; }
          .form-row { grid-template-columns: 1fr; }
          .filtre-alani { flex-direction: column; }
          .arama-input, .kategori-select { width: 100%; }
          .modal-arka { padding: 14px; align-items: flex-end; }
          .modal-kart { padding: 24px 20px; border-radius: 20px; max-width: none; }
          .toast { right: 12px; bottom: 12px; left: 12px; text-align: center; }
        }
      `}</style>

      <div className="ust-alan">
        <div>
          <p className="etiket">YÖNETİM · ÜRÜNLER</p>
          <h2 className="baslik">Ürünler</h2>
        </div>
        <button type="button" onClick={yeniAc} className="ekle-btn">
          + YENİ ÜRÜN
        </button>
      </div>

      <div className="filtre-alani">
        <input
          type="search"
          placeholder="Ürün adıyla ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          className="arama-input"
        />
        <select
          value={filtreKategori}
          onChange={(e) => setFiltreKategori(e.target.value)}
          className="kategori-select"
        >
          <option value="hepsi">Tüm Kategoriler</option>
          {kategoriler.map((k) => (
            <option key={k.id} value={k.id}>{k.isim}</option>
          ))}
        </select>
      </div>

      {listelenenUrunler.length === 0 ? (
        <div style={{ padding: "70px 20px", border: "1px dashed rgba(20,20,20,0.15)", borderRadius: 20, background: "rgba(255,255,255,0.5)", textAlign: "center", color: "#888" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📦</div>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600 }}>Ürün bulunamadı</p>
          <p style={{ margin: 0, fontSize: 12 }}>Kriterlere uygun ürün yok veya henüz eklenmedi.</p>
        </div>
      ) : (
        <div className="liste-kutu">
          {listelenenUrunler.map((urun) => (
            <div key={urun.id} className="satir">
              <div className="gorsel" aria-hidden="true">
                {urun.gorselUrl ? <img src={urun.gorselUrl} alt="" /> : urun.sembol}
              </div>
              <div className="bilgi">
                <h3 className="isim">
                  {urun.isim}
                  {/* STOK DURUMU */}
                  <span className={`stok-badge ${urun.stok > 0 ? "var" : "yok"}`}>
                    {urun.stok > 0 ? `Stok: ${urun.stok}` : "TÜKENDİ"}
                  </span>
                </h3>
                <p className="kategori">{kategoriBul(urun.kategoriId)?.isim ?? "Kategorisiz"}</p>
              </div>
              <div className="fiyat">{PARA(urun.fiyat)}</div>
              <div className="islemler">
                <button type="button" className="btn duzenle" onClick={() => duzenleAc(urun)}>✎ Düzenle</button>
                <button type="button" className="btn sil" onClick={() => setSilinecekId(urun.id)}>🗑 Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODALI (EKLEME VE DÜZENLEME) */}
      {form.acik && (
        <div className="modal-arka" role="presentation" onClick={(e) => { if(e.target === e.currentTarget) formKapat() }}>
          <form onSubmit={kaydet} className="modal-kart">
            <h3 className="modal-baslik">
              {form.duzenlenenId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h3>

            {/* GÖRSEL YÜKLEME ALANI */}
            <div className="form-grup">
              <label className="form-etiket">ÜRÜN GÖRSELİ (OPSİYONEL)</label>
              {form.gorselUrl ? (
                <div style={{ position: "relative" }}>
                  <img src={form.gorselUrl} alt="Önizleme" className="resim-onizleme" />
                  <button type="button" className="resim-sil-btn" onClick={() => setForm(f => ({...f, gorselUrl: ""}))}>✕</button>
                </div>
              ) : (
                <label className="resim-alani">
                  {yukleniyor ? (
                    <span style={{ fontSize: 13, color: "#8f733f" }}>Yükleniyor...</span>
                  ) : (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
                      <div style={{ fontSize: 12, color: "#666" }}>Tıkla ve bir fotoğraf seç</div>
                      <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>(Otomatik sıkıştırılır)</div>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={resimYukle} style={{ display: "none" }} disabled={yukleniyor} />
                </label>
              )}
            </div>

            <div className="form-grup">
              <label className="form-etiket">ÜRÜN ADI *</label>
              <input type="text" value={form.isim} onChange={(e) => setForm((f) => ({ ...f, isim: e.target.value }))} placeholder="Örn: Yıldız Kolye" className="form-input" required />
            </div>

            <div className="form-row form-grup">
              <div>
                <label className="form-etiket">KATEGORİ *</label>
                <select value={form.kategoriId} onChange={(e) => setForm((f) => ({ ...f, kategoriId: e.target.value }))} className="form-select" required>
                  <option value="" disabled>Seçiniz...</option>
                  {kategoriler.map((k) => (
                    <option key={k.id} value={k.id}>{k.isim}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-etiket">FİYAT (₺) *</label>
                <input type="number" value={form.fiyat} onChange={(e) => setForm((f) => ({ ...f, fiyat: e.target.value }))} placeholder="Örn: 850" className="form-input" min="1" required />
              </div>
            </div>

            {/* STOK ALANI */}
            <div className="form-row form-grup">
              <div>
                <label className="form-etiket">STOK ADEDİ *</label>
                <input type="number" value={form.stok} onChange={(e) => setForm((f) => ({ ...f, stok: e.target.value }))} placeholder="Örn: 10" className="form-input" min="0" required />
              </div>
              <div>
                <label className="form-etiket">SEMBOL (YEDEK) *</label>
                <input type="text" value={form.sembol} onChange={(e) => setForm((f) => ({ ...f, sembol: e.target.value }))} placeholder="Örn: 🌟" className="form-input" maxLength={4} required />
              </div>
            </div>

            <div className="form-grup">
              <label className="form-etiket">ETİKET (OPSİYONEL)</label>
              <input type="text" value={form.etiket} onChange={(e) => setForm((f) => ({ ...f, etiket: e.target.value }))} placeholder="Örn: YENİ" className="form-input" maxLength={20} />
            </div>

            <div className="form-grup">
              <label className="form-etiket">AÇIKLAMA *</label>
              <textarea value={form.aciklama} onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))} placeholder="Ürünün detaylarını buraya yazın..." className="form-textarea" required />
            </div>

            {formHata && <div className="form-hata">{formHata}</div>}

            <div className="modal-butonlar">
              <button type="button" onClick={formKapat} className="modal-btn iptal" disabled={yukleniyor}>İPTAL</button>
              <button type="submit" className="modal-btn olustur" disabled={yukleniyor}>{form.duzenlenenId ? "GÜNCELLE" : "KAYDET"}</button>
            </div>
          </form>
        </div>
      )}

      {/* SİLME ONAY MODALI */}
      {silinecekUrun && (
        <div className="modal-arka" role="presentation" onClick={(e) => { if(e.target === e.currentTarget) setSilinecekId(null) }}>
          <div className="modal-kart">
            <div className="sil-uyari" aria-hidden="true">⚠️</div>
            <h3 className="sil-baslik">Silmek istediğine emin misin?</h3>
            <p className="sil-aciklama">
              <strong>{silinecekUrun.isim}</strong> ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="modal-butonlar">
              <button type="button" onClick={() => setSilinecekId(null)} className="modal-btn iptal">İPTAL</button>
              <button type="button" onClick={silOnayla} className="modal-btn sil">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {bildirim && <div className="toast" role="status" aria-live="polite">{bildirim}</div>}
    </>
  );
}