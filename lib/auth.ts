/**
 * Demo amaçlı basit şifre kontrolü.
 * Gerçek güvenlik DEĞİL — sadece demo hissiyatı için.
 * Şifre: zyren2026
 */

const SIFRE = "zyren2026";
const OTURUM_ANAHTARI = "zyren-admin-oturum";

export function girisYap(sifre: string): boolean {
  if (sifre === SIFRE) {
    try {
      localStorage.setItem(OTURUM_ANAHTARI, "1");
    } catch {
      // sessizce geç
    }
    return true;
  }
  return false;
}

export function cikisYap(): void {
  try {
    localStorage.removeItem(OTURUM_ANAHTARI);
  } catch {
    // sessizce geç
  }
}

export function girisYapildiMi(): boolean {
  try {
    return localStorage.getItem(OTURUM_ANAHTARI) === "1";
  } catch {
    return false;
  }
}