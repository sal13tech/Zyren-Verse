"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/contexts/StoreContext";
import type { Kategori } from "@/lib/types";

type FormDurum = {
  acik: boolean;
  duzenlenenId: string | null;
  isim: string;
  sembol: string;
};

const BOS_FORM: FormDurum = {
  acik: false,
  duzenlenenId: null,
  isim: "",
  sembol: "",
};

export default function AdminKategoriler() {
  const {
    kategoriler,
    kategoriEkle,
    kategoriGuncelle,
    kategoriSil,
    urunleriKategoriyeGore,
    hazir,
  } = useStore();

  const [form, setForm] = useState<FormDurum>(BOS_FORM);
  const [formHata, setFormHata] = useState("");
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [bildirim, setBildirim] = useState("");

  const siraliKategoriler = useMemo(
    () => [...kategoriler].sort((a, b) => a.sira - b.sira),
    [kategoriler],
  );

  const silinecekKategori = silinecekId
    ? kategoriler.find((k) => k.id === silinecekId) ?? null
    : null;
  const silinecekUrunSayisi = silinecekId
    ? urunleriKategoriyeGore(silinecekId).length
    : 0;

  function toast(mesaj: string) {
    setBildirim(mesaj);
    window.setTimeout(() => setBildirim(""), 2600);
  }

  function yeniAc() {
    setForm({ acik: true, duzenlenenId: null, isim: "", sembol: "" });
    setFormHata("");
  }

  function duzenleAc(k: Kategori) {
    setForm({
      acik: true,
      duzenlenenId: k.id,
      isim: k.isim,
      sembol: k.sembol ?? "",
    });
    setFormHata("");
  }

  function formKapat() {
    setForm(BOS_FORM);
    setFormHata("");
  }

  function kaydet(e: FormEvent) {
    e.preventDefault();
    const isim = form.isim.trim();
    const sembol = form.sembol.trim();

    if (isim.length < 2) {
      setFormHata("Kategori adı en az 2 karakter olmalı.");
      return;
    }
    if (isim.length > 50) {
      setFormHata("Kategori adı 50 karakterden uzun olamaz.");
      return;
    }

    const cakisan = kategoriler.find(
      (k) =>
        k.id !== form.duzenlenenId &&
        k.isim.toLocaleLowerCase("tr-TR") === isim.toLocaleLowerCase("tr-TR"),
    );
    if (cakisan) {
      setFormHata("Bu isimde bir kategori zaten var.");
      return;
    }

    if (form.duzenlenenId) {
      kategoriGuncelle(form.duzenlenenId, {
        isim,
        sembol: sembol || undefined,
      });
      toast("Kategori güncellendi.");
    } else {
      kategoriEkle({ isim, sembol: sembol || undefined });
      toast("Kategori eklendi.");
    }

    formKapat();
  }

  function silOnayla() {
    if (!silinecekId) return;
    kategoriSil(silinecekId);
    toast("Kategori silindi.");
    setSilinecekId(null);
  }

  function siraDegistir(id: string, yon: "yukari" | "asagi") {
    const idx = siraliKategoriler.findIndex((k) => k.id === id);
    if (idx === -1) return;

    const hedefIdx = yon === "yukari" ? idx - 1 : idx + 1;
    if (hedefIdx < 0 || hedefIdx >= siraliKategoriler.length) return;

    const mevcut = siraliKategoriler[idx];
    const hedef = siraliKategoriler[hedefIdx];

    kategoriGuncelle(mevcut.id, { sira: hedef.sira });
    kategoriGuncelle(hedef.id, { sira: mevcut.sira });
  }

  if (!hazir) {
    return <div className="kat-yukleniyor">YÜKLENİYOR…</div>;
  }

  return (
    <>
      <style jsx>{`
        .kat-yukleniyor {
          padding: 60px 20px;
          text-align: center;
          color: #999;
          font-size: 13px;
          letter-spacing: 2px;
        }

        .kat-ust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
        }

        .kat-etiket {
          margin: 0 0 4px;
          color: #8f8a72;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .kat-baslik {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 26px;
          font-weight: 500;
        }

        .kat-ekle-btn {
          padding: 12px 22px;
          border: 1px solid #171717;
          border-radius: 50px;
          background: #171717;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .kat-bos {
          padding: 70px 20px;
          border: 1px dashed rgba(20, 20, 20, 0.15);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.5);
          text-align: center;
          color: #888;
        }

        .kat-bos-ikon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .kat-bos-baslik {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
        }

        .kat-bos-alt {
          margin: 0;
          font-size: 12px;
        }

        .kat-liste {
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.65);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 15px 40px rgba(30, 30, 30, 0.05);
        }

        .kat-satir {
          display: grid;
          grid-template-columns: 60px 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid rgba(20, 20, 20, 0.06);
        }

        .kat-satir:last-child {
          border-bottom: none;
        }

        .kat-sembol {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(145deg, #ffffff, #f0eeea);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
          font-size: 24px;
        }

        .kat-bilgi {
          min-width: 0;
        }

        .kat-isim {
          margin: 0 0 4px;
          font-family: Georgia, serif;
          font-size: 19px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .kat-urun-sayi {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
        }

        .kat-urun-sayi.var {
          color: #8f733f;
        }

        .kat-urun-sayi.yok {
          color: #999;
        }

        .kat-siralama {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .kat-sira-btn {
          width: 28px;
          height: 22px;
          border: 1px solid rgba(20, 20, 20, 0.08);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.7);
          font-size: 10px;
          line-height: 1;
        }

        .kat-sira-btn:disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .kat-islemler {
          display: flex;
          gap: 6px;
        }

        .kat-btn {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .kat-btn.duzenle {
          border: 1px solid rgba(20, 20, 20, 0.1);
          background: rgba(255, 255, 255, 0.8);
          color: #444;
        }

        .kat-btn.sil {
          border: 1px solid rgba(180, 90, 90, 0.25);
          background: rgba(255, 245, 245, 0.7);
          color: #a04040;
        }

        .modal-arka {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(30, 30, 30, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .modal-kart {
          width: 100%;
          max-width: 460px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 40px 90px rgba(20, 20, 20, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-baslik {
          margin: 0 0 22px;
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 500;
        }

        .form-etiket {
          display: block;
          margin-bottom: 6px;
          color: #555;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .form-input {
          width: 100%;
          min-height: 46px;
          padding: 0 16px;
          border: 1px solid rgba(20, 20, 20, 0.12);
          border-radius: 12px;
          background: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .form-input.sembol {
          font-size: 20px;
          margin-bottom: 16px;
        }

        .form-hata {
          margin-top: 12px;
          padding: 10px 14px;
          border: 1px solid rgba(180, 90, 90, 0.3);
          border-radius: 10px;
          background: rgba(255, 240, 240, 0.9);
          color: #a04040;
          font-size: 12px;
        }

        .modal-butonlar {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }

        .modal-btn {
          flex: 1;
          min-height: 46px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .modal-btn.iptal {
          border: 1px solid rgba(20, 20, 20, 0.15);
          background: transparent;
          color: #444;
        }

        .modal-btn.olustur {
          border: 1px solid #171717;
          background: #171717;
          color: #fff;
        }

        .modal-btn.sil {
          border: 1px solid #a04040;
          background: #a04040;
          color: #fff;
        }

        .sil-uyari {
          font-size: 38px;
          text-align: center;
          margin-bottom: 8px;
        }

        .sil-baslik {
          margin: 0 0 12px;
          text-align: center;
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 500;
        }

        .sil-aciklama {
          margin: 0 0 8px;
          color: #666;
          font-size: 13px;
          text-align: center;
          line-height: 1.7;
        }

        .sil-uyari-kutu {
          margin-top: 12px;
          padding: 12px 14px;
          border: 1px solid rgba(180, 90, 90, 0.3);
          border-radius: 12px;
          background: rgba(255, 240, 240, 0.9);
          color: #a04040;
          font-size: 12px;
          text-align: center;
          line-height: 1.6;
        }

        .toast {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 250;
          padding: 14px 22px;
          border: 1px solid rgba(168, 138, 86, 0.25);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.98);
          color: #303030;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 15px 40px rgba(30, 30, 30, 0.15);
        }

        @media (max-width: 640px) {
          .kat-ust {
            gap: 10px;
          }

          .kat-baslik {
            font-size: 22px;
          }

          .kat-ekle-btn {
            padding: 10px 18px;
            font-size: 11px;
            letter-spacing: 1px;
          }

          .kat-liste {
            border-radius: 14px;
          }

          .kat-satir {
            grid-template-columns: 48px 1fr;
            gap: 12px;
            padding: 14px 16px;
            row-gap: 10px;
          }

          .kat-sembol {
            width: 42px;
            height: 42px;
            font-size: 20px;
            border-radius: 12px;
            grid-row: span 2;
          }

          .kat-isim {
            font-size: 16px;
          }

          .kat-urun-sayi {
            font-size: 10px;
          }

          .kat-siralama {
            flex-direction: row;
            gap: 4px;
            grid-column: 2;
          }

          .kat-islemler {
            grid-column: 2;
            flex-wrap: wrap;
          }

          .kat-btn {
            padding: 7px 11px;
            font-size: 10px;
          }

          .modal-arka {
            padding: 14px;
            align-items: flex-end;
          }

          .modal-kart {
            padding: 24px 20px;
            border-radius: 20px;
            max-width: none;
          }

          .modal-baslik {
            font-size: 20px;
            margin-bottom: 18px;
          }

          .sil-baslik {
            font-size: 18px;
          }

          .sil-aciklama {
            font-size: 12px;
          }

          .modal-btn {
            min-height: 44px;
            font-size: 11px;
          }

          .toast {
            right: 12px;
            bottom: 12px;
            left: 12px;
            max-width: none;
            padding: 12px 16px;
            font-size: 11px;
            text-align: center;
          }
        }
      `}</style>

      <div className="kat-ust">
        <div>
          <p className="kat-etiket">YÖNETİM · KATEGORİLER</p>
          <h2 className="kat-baslik">Kategoriler</h2>
        </div>

        <button type="button" onClick={yeniAc} className="kat-ekle-btn">
          + YENİ KATEGORİ
        </button>
      </div>

      {siraliKategoriler.length === 0 ? (
        <div className="kat-bos">
          <div className="kat-bos-ikon" aria-hidden="true">
            🗂️
          </div>
          <p className="kat-bos-baslik">Henüz kategori yok</p>
          <p className="kat-bos-alt">
            Sağ üstteki butonla ilk kategorini oluştur.
          </p>
        </div>
      ) : (
        <div className="kat-liste">
          {siraliKategoriler.map((k) => {
            const urunSayisi = urunleriKategoriyeGore(k.id).length;
            const idx = siraliKategoriler.findIndex((x) => x.id === k.id);
            const yukariPasif = idx === 0;
            const asagiPasif = idx === siraliKategoriler.length - 1;

            return (
              <div key={k.id} className="kat-satir">
                <div className="kat-sembol" aria-hidden="true">
                  {k.sembol ?? "◯"}
                </div>

                <div className="kat-bilgi">
                  <h3 className="kat-isim">{k.isim}</h3>
                  <p
                    className={`kat-urun-sayi ${
                      urunSayisi > 0 ? "var" : "yok"
                    }`}
                  >
                    {urunSayisi} ürün
                  </p>
                </div>

                <div className="kat-siralama">
                  <button
                    type="button"
                    disabled={yukariPasif}
                    onClick={() => siraDegistir(k.id, "yukari")}
                    aria-label="Yukarı taşı"
                    className="kat-sira-btn"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={asagiPasif}
                    onClick={() => siraDegistir(k.id, "asagi")}
                    aria-label="Aşağı taşı"
                    className="kat-sira-btn"
                  >
                    ▼
                  </button>
                </div>

                <div className="kat-islemler">
                  <button
                    type="button"
                    onClick={() => duzenleAc(k)}
                    className="kat-btn duzenle"
                  >
                    ✎ Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => setSilinecekId(k.id)}
                    className="kat-btn sil"
                  >
                    🗑 Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form.acik && (
        <div
          className="modal-arka"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) formKapat();
          }}
        >
          <form onSubmit={kaydet} className="modal-kart">
            <h3 className="modal-baslik">
              {form.duzenlenenId ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </h3>

            <label className="form-etiket">SEMBOL (EMOJİ)</label>
            <input
              type="text"
              value={form.sembol}
              onChange={(e) =>
                setForm((f) => ({ ...f, sembol: e.target.value }))
              }
              placeholder="📿"
              maxLength={4}
              className="form-input sembol"
            />

            <label className="form-etiket">KATEGORİ ADI *</label>
            <input
              type="text"
              value={form.isim}
              onChange={(e) =>
                setForm((f) => ({ ...f, isim: e.target.value }))
              }
              placeholder="Örn: Kolyeler"
              autoFocus
              maxLength={50}
              className="form-input"
            />

            {formHata && <div className="form-hata">{formHata}</div>}

            <div className="modal-butonlar">
              <button
                type="button"
                onClick={formKapat}
                className="modal-btn iptal"
              >
                İPTAL
              </button>
              <button type="submit" className="modal-btn olustur">
                {form.duzenlenenId ? "GÜNCELLE" : "OLUŞTUR"}
              </button>
            </div>
          </form>
        </div>
      )}

      {silinecekKategori && (
        <div
          className="modal-arka"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSilinecekId(null);
          }}
        >
          <div className="modal-kart">
            <div className="sil-uyari" aria-hidden="true">
              ⚠️
            </div>
            <h3 className="sil-baslik">Silmek istediğine emin misin?</h3>
            <p className="sil-aciklama">
              <strong>{silinecekKategori.isim}</strong> kategorisi kalıcı olarak
              silinecek.
            </p>

            {silinecekUrunSayisi > 0 && (
              <div className="sil-uyari-kutu">
                Bu kategoride <strong>{silinecekUrunSayisi} ürün</strong> var.
                <br />
                Kategoriyle birlikte onlar da silinecek.
              </div>
            )}

            <div className="modal-butonlar">
              <button
                type="button"
                onClick={() => setSilinecekId(null)}
                className="modal-btn iptal"
              >
                İPTAL
              </button>
              <button
                type="button"
                onClick={silOnayla}
                className="modal-btn sil"
              >
                EVET, SİL
              </button>
            </div>
          </div>
        </div>
      )}

      {bildirim && (
        <div className="toast" role="status" aria-live="polite">
          {bildirim}
        </div>
      )}
    </>
  );
}