"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Kategori, StoreContextTipi, Urun } from "@/lib/types";

import {
  kategoriEkleApi,
  kategoriGuncelleApi,
  kategoriSilApi,
  sifirlaApi,
  urunEkleApi,
  urunGuncelleApi,
  urunSilApi,
  verileriYukle,
  yeniId,
} from "@/lib/storage";

const StoreContext = createContext<StoreContextTipi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [hazir, setHazir] = useState(false);

  /* Sunucudan veri çek */
  useEffect(() => {
    (async () => {
      const veri = await verileriYukle();
      setUrunler(veri.urunler);
      setKategoriler(veri.kategoriler);
      setHazir(true);
    })();
  }, []);

  const urunEkle: StoreContextTipi["urunEkle"] = useCallback((veri) => {
    const yeni: Urun = {
      ...veri,
      id: yeniId("urun"),
      createdAt: Date.now(),
    };
    setUrunler((onceki) => [yeni, ...onceki]);
    urunEkleApi(yeni);
    return yeni;
  }, []);

  const urunGuncelle: StoreContextTipi["urunGuncelle"] = useCallback(
    (id, veri) => {
      setUrunler((onceki) =>
        onceki.map((u) => (u.id === id ? { ...u, ...veri } : u)),
      );
      urunGuncelleApi(id, veri);
    },
    [],
  );

  const urunSil: StoreContextTipi["urunSil"] = useCallback((id) => {
    setUrunler((onceki) => onceki.filter((u) => u.id !== id));
    urunSilApi(id);
  }, []);

  const kategoriEkle: StoreContextTipi["kategoriEkle"] = useCallback((veri) => {
    const yeni: Kategori = {
      ...veri,
      id: yeniId("kat"),
      sira: 0,
    };

    setKategoriler((onceki) => {
      const maxSira = onceki.reduce((m, k) => Math.max(m, k.sira), 0);
      yeni.sira = maxSira + 1;
      return [...onceki, yeni];
    });

    window.setTimeout(() => kategoriEkleApi(yeni), 0);

    return yeni;
  }, []);

  const kategoriGuncelle: StoreContextTipi["kategoriGuncelle"] = useCallback(
    (id, veri) => {
      setKategoriler((onceki) =>
        onceki.map((k) => (k.id === id ? { ...k, ...veri } : k)),
      );
      kategoriGuncelleApi(id, veri);
    },
    [],
  );

  const kategoriSil: StoreContextTipi["kategoriSil"] = useCallback((id) => {
    setKategoriler((onceki) => onceki.filter((k) => k.id !== id));
    setUrunler((onceki) => onceki.filter((u) => u.kategoriId !== id));
    kategoriSilApi(id);
  }, []);

  const kategoriBul = useCallback(
    (id: string) => kategoriler.find((k) => k.id === id),
    [kategoriler],
  );

  const urunleriKategoriyeGore = useCallback(
    (kategoriId: string) => urunler.filter((u) => u.kategoriId === kategoriId),
    [urunler],
  );

  const fabrikaAyarlarinaDonCallback = useCallback(() => {
    sifirlaApi().then((yeni) => {
      if (yeni) {
        setUrunler(yeni.urunler);
        setKategoriler(yeni.kategoriler);
      }
    });
  }, []);

  const deger = useMemo<StoreContextTipi>(
    () => ({
      urunler,
      kategoriler,
      hazir,
      urunEkle,
      urunGuncelle,
      urunSil,
      kategoriEkle,
      kategoriGuncelle,
      kategoriSil,
      kategoriBul,
      urunleriKategoriyeGore,
      fabrikaAyarlarinaDon: fabrikaAyarlarinaDonCallback,
    }),
    [
      urunler,
      kategoriler,
      hazir,
      urunEkle,
      urunGuncelle,
      urunSil,
      kategoriEkle,
      kategoriGuncelle,
      kategoriSil,
      kategoriBul,
      urunleriKategoriyeGore,
      fabrikaAyarlarinaDonCallback,
    ],
  );

  return (
    <StoreContext.Provider value={deger}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextTipi {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error(
      "useStore, StoreProvider içinde kullanılmalı. app/layout.tsx'e <StoreProvider> ekledin mi?",
    );
  }
  return ctx;
}