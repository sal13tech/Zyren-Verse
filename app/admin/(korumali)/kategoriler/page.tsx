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
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#999", fontSize: 13, letterSpacing: 2 }}>
        YÜKLENİYOR…
      </div>
    );
  }

  return (
    <>
      {/* ÜST BAŞLIK */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <p style={{ margin: "0 0 4px", color: "#8f8a72", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
            YÖNETİM · KATEGORİLER
          </p>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 500 }}>
            Kategoriler
          </h2>
        </div>

        <button type="button" onClick={yeniAc} style={{ padding: "12px 22px", border: "1px solid #171717", borderRadius: 50, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
          + YENİ KATEGORİ
        </button>
      </div>

      {/* LİSTE */}
      {siraliKategoriler.length === 0 ? (
        <div style={{ padding: "70px 20px", border: "1px dashed rgba(20,20,20,0.15)", borderRadius: 20, background: "rgba(255,255,255,0.5)", textAlign: "center", color: "#888" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🗂️</div>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600 }}>Henüz kategori yok</p>
          <p style={{ margin: 0, fontSize: 12 }}>Sağ üstteki butonla ilk kategorini oluştur.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(255,255,255,0.85)", borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,0.65)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 15px 40px rgba(30,30,30,0.05)" }}>
          {siraliKategoriler.map((k, idx) => {
            const urunSayisi = urunleriKategoriyeGore(k.id).length;
            const yukariPasif = idx === 0;
            const asagiPasif = idx === siraliKategoriler.length - 1;

            return (
              <div key={k.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto auto", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: idx === siraliKategoriler.length - 1 ? "none" : "1px solid rgba(20,20,20,0.06)" }}>
                <div style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 14, background: "linear-gradient(145deg, #ffffff, #f0eeea)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)", fontSize: 24 }} aria-hidden="true">
                  {k.sembol ?? "◯"}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {k.isim}
                  </h3>
                  <p style={{ margin: 0, color: urunSayisi > 0 ? "#8f733f" : "#999", fontSize: 11, fontWeight: 600 }}>
                    {urunSayisi} ürün
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <button type="button" disabled={yukariPasif} onClick={() => siraDegistir(k.id, "yukari")} aria-label="Yukarı taşı" style={{ width: 28, height: 22, border: "1px solid rgba(20,20,20,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.7)", color: yukariPasif ? "#ccc" : "#666", fontSize: 10, cursor: yukariPasif ? "not-allowed" : "pointer", lineHeight: 1 }}>
                    ▲
                  </button>
                  <button type="button" disabled={asagiPasif} onClick={() => siraDegistir(k.id, "asagi")} aria-label="Aşağı taşı" style={{ width: 28, height: 22, border: "1px solid rgba(20,20,20,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.7)", color: asagiPasif ? "#ccc" : "#666", fontSize: 10, cursor: asagiPasif ? "not-allowed" : "pointer", lineHeight: 1 }}>
                    ▼
                  </button>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => duzenleAc(k)} style={{ padding: "8px 12px", border: "1px solid rgba(20,20,20,0.1)", borderRadius: 10, background: "rgba(255,255,255,0.8)", color: "#444", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    ✎ Düzenle
                  </button>
                  <button type="button" onClick={() => setSilinecekId(k.id)} style={{ padding: "8px 12px", border: "1px solid rgba(180,90,90,0.25)", borderRadius: 10, background: "rgba(255,245,245,0.7)", color: "#a04040", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    🗑 Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODALI */}
      {form.acik && (
        <div role="presentation" onClick={(e) => { if (e.target === e.currentTarget) formKapat(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20, background: "rgba(30,30,30,0.35)", backdropFilter: "blur(10px)" }}>
          <form onSubmit={kaydet} style={{ width: "100%", maxWidth: 460, padding: 30, border: "1px solid rgba(255,255,255,0.9)", borderRadius: 22, background: "rgba(255,255,255,0.95)", boxShadow: "0 40px 90px rgba(20,20,20,0.2)" }}>
            <h3 style={{ margin: "0 0 22px", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500 }}>
              {form.duzenlenenId ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </h3>

            <label style={{ display: "block", marginBottom: 6, color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              SEMBOL (EMOJİ)
            </label>
            <input type="text" value={form.sembol} onChange={(e) => setForm((f) => ({ ...f, sembol: e.target.value }))} placeholder="📿" maxLength={4} style={{ width: "100%", minHeight: 46, padding: "0 16px", marginBottom: 16, border: "1px solid rgba(20,20,20,0.12)", borderRadius: 12, background: "#fff", fontSize: 20, outline: "none", boxSizing: "border-box" }} />

            <label style={{ display: "block", marginBottom: 6, color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              KATEGORİ ADI *
            </label>
            <input type="text" value={form.isim} onChange={(e) => setForm((f) => ({ ...f, isim: e.target.value }))} placeholder="Örn: Kolyeler" autoFocus maxLength={50} style={{ width: "100%", minHeight: 46, padding: "0 16px", border: "1px solid rgba(20,20,20,0.12)", borderRadius: 12, background: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />

            {formHata && (
              <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid rgba(180,90,90,0.3)", borderRadius: 10, background: "rgba(255,240,240,0.9)", color: "#a04040", fontSize: 12 }}>
                {formHata}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="button" onClick={formKapat} style={{ flex: 1, minHeight: 46, border: "1px solid rgba(20,20,20,0.15)", borderRadius: 50, background: "transparent", color: "#444", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
                İPTAL
              </button>
              <button type="submit" style={{ flex: 1, minHeight: 46, border: "1px solid #171717", borderRadius: 50, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
                {form.duzenlenenId ? "GÜNCELLE" : "OLUŞTUR"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SİLME ONAY */}
      {silinecekKategori && (
        <div role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setSilinecekId(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20, background: "rgba(30,30,30,0.35)", backdropFilter: "blur(10px)" }}>
          <div style={{ width: "100%", maxWidth: 420, padding: 30, border: "1px solid rgba(255,255,255,0.9)", borderRadius: 22, background: "rgba(255,255,255,0.95)", boxShadow: "0 40px 90px rgba(20,20,20,0.2)" }}>
            <div style={{ fontSize: 38, textAlign: "center", marginBottom: 8 }}>⚠️</div>
            <h3 style={{ margin: "0 0 12px", textAlign: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 500 }}>
              Silmek istediğine emin misin?
            </h3>
            <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13, textAlign: "center", lineHeight: 1.7 }}>
              <strong>{silinecekKategori.isim}</strong> kategorisi kalıcı olarak silinecek.
            </p>

            {silinecekUrunSayisi > 0 && (
              <div style={{ marginTop: 12, padding: "12px 14px", border: "1px solid rgba(180,90,90,0.3)", borderRadius: 12, background: "rgba(255,240,240,0.9)", color: "#a04040", fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
                Bu kategoride <strong>{silinecekUrunSayisi} ürün</strong> var.
                <br />
                Kategoriyle birlikte onlar da silinecek.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="button" onClick={() => setSilinecekId(null)} style={{ flex: 1, minHeight: 46, border: "1px solid rgba(20,20,20,0.15)", borderRadius: 50, background: "transparent", color: "#444", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
                İPTAL
              </button>
              <button type="button" onClick={silOnayla} style={{ flex: 1, minHeight: 46, border: "1px solid #a04040", borderRadius: 50, background: "#a04040", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
                EVET, SİL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BİLDİRİM */}
      {bildirim && (
        <div role="status" aria-live="polite" style={{ position: "fixed", right: 22, bottom: 22, zIndex: 250, padding: "14px 22px", border: "1px solid rgba(168,138,86,0.25)", borderRadius: 50, background: "rgba(255,255,255,0.95)", color: "#303030", fontSize: 12, fontWeight: 600, boxShadow: "0 15px 40px rgba(30,30,30,0.15)" }}>
          {bildirim}
        </div>
      )}
    </>
  );
}