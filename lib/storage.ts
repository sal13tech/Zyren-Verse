import type { Kategori, Urun } from "./types";
import { SEED_KATEGORILER, SEED_URUNLER } from "./seed";

const URUN_ANAHTARI = "zyren-urunler";
const KATEGORI_ANAHTARI = "zyren-kategoriler";
const VERSIYON_ANAHTARI = "zyren-veri-versiyon";

const VERSIYON = 1;

function guvenliOku<T>(anahtar: string): T | null {
  try {
    const ham = localStorage.getItem(anahtar);
    if (!ham) return null;
    return JSON.parse(ham) as T;
  } catch {
    return null;
  }
}

function guvenliYaz(anahtar: string, deger: unknown): void {
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch (err) {
    console.warn(`"${anahtar}" kaydedilemedi:`, err);
  }
}

function versiyonKontrol(): void {
  try {
    const kayitli = localStorage.getItem(VERSIYON_ANAHTARI);
    if (kayitli !== String(VERSIYON)) {
      localStorage.removeItem(URUN_ANAHTARI);
      localStorage.removeItem(KATEGORI_ANAHTARI);
      localStorage.setItem(VERSIYON_ANAHTARI, String(VERSIYON));
    }
  } catch {
    // sessizce geç
  }
}

export function urunleriYukle(): Urun[] {
  versiyonKontrol();
  const kayitli = guvenliOku<Urun[]>(URUN_ANAHTARI);
  if (kayitli && Array.isArray(kayitli) && kayitli.length > 0) {
    return kayitli;
  }
  guvenliYaz(URUN_ANAHTARI, SEED_URUNLER);
  return SEED_URUNLER;
}

export function urunleriKaydet(urunler: Urun[]): void {
  guvenliYaz(URUN_ANAHTARI, urunler);
}

export function kategorileriYukle(): Kategori[] {
  versiyonKontrol();
  const kayitli = guvenliOku<Kategori[]>(KATEGORI_ANAHTARI);
  if (kayitli && Array.isArray(kayitli) && kayitli.length > 0) {
    return kayitli.sort((a, b) => a.sira - b.sira);
  }
  guvenliYaz(KATEGORI_ANAHTARI, SEED_KATEGORILER);
  return SEED_KATEGORILER;
}

export function kategorileriKaydet(kategoriler: Kategori[]): void {
  guvenliYaz(KATEGORI_ANAHTARI, kategoriler);
}

export function fabrikaAyarlarinaDon(): {
  urunler: Urun[];
  kategoriler: Kategori[];
} {
  try {
    localStorage.removeItem(URUN_ANAHTARI);
    localStorage.removeItem(KATEGORI_ANAHTARI);
    localStorage.setItem(VERSIYON_ANAHTARI, String(VERSIYON));
  } catch {
    // sessizce geç
  }
  guvenliYaz(URUN_ANAHTARI, SEED_URUNLER);
  guvenliYaz(KATEGORI_ANAHTARI, SEED_KATEGORILER);
  return { urunler: SEED_URUNLER, kategoriler: SEED_KATEGORILER };
}

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