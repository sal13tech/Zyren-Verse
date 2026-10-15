import type { Kategori, Urun } from "./types";
import { SEED_KATEGORILER, SEED_URUNLER } from "./seed";

export type TumVeri = {
  urunler: Urun[];
  kategoriler: Kategori[];
};

/** Sunucudan tüm veriyi çeker. Başarısız olursa seed'e düşer. */
export async function verileriYukle(): Promise<TumVeri> {
  try {
    const res = await fetch("/api/veri", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Partial<TumVeri>;
    return {
      urunler: Array.isArray(data.urunler) ? data.urunler : [],
      kategoriler: Array.isArray(data.kategoriler) ? data.kategoriler : [],
    };
  } catch (err) {
    console.warn("Veri yüklenemedi, seed kullanılıyor:", err);
    return {
      urunler: SEED_URUNLER,
      kategoriler: SEED_KATEGORILER,
    };
  }
}

/* ---------------- Fire-and-forget yazma işlemleri ---------------- */

export function urunEkleApi(urun: Urun): void {
  fetch("/api/urunler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(urun),
  }).catch((err) => console.error("Ürün eklenemedi:", err));
}

export function urunGuncelleApi(id: string, veri: Partial<Urun>): void {
  fetch(`/api/urunler/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  }).catch((err) => console.error("Ürün güncellenemedi:", err));
}

export function urunSilApi(id: string): void {
  fetch(`/api/urunler/${id}`, { method: "DELETE" }).catch((err) =>
    console.error("Ürün silinemedi:", err),
  );
}

export function kategoriEkleApi(kategori: Kategori): void {
  fetch("/api/kategoriler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(kategori),
  }).catch((err) => console.error("Kategori eklenemedi:", err));
}

export function kategoriGuncelleApi(
  id: string,
  veri: Partial<Kategori>,
): void {
  fetch(`/api/kategoriler/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veri),
  }).catch((err) => console.error("Kategori güncellenemedi:", err));
}

export function kategoriSilApi(id: string): void {
  fetch(`/api/kategoriler/${id}`, { method: "DELETE" }).catch((err) =>
    console.error("Kategori silinemedi:", err),
  );
}

export async function sifirlaApi(): Promise<TumVeri | null> {
  try {
    const res = await fetch("/api/sifirla", { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await verileriYukle();
  } catch (err) {
    console.error("Sıfırlama başarısız:", err);
    return null;
  }
}

/* ---------------- Yardımcı ---------------- */

export function yeniId(onek = "id"): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${onek}-${crypto.randomUUID()}`;
    }
  } catch {
    // fallthrough
  }
  return `${onek}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}