export type Kategori = {
  id: string;
  isim: string;
  sira: number;
  sembol?: string;
};

export type Urun = {
  id: string;
  isim: string;
  kategoriId: string;
  fiyat: number;
  sembol: string;
  gorselUrl?: string;
  etiket?: string;
  aciklama: string;
  createdAt: number;
  stok: number; // STOK EKLENDİ
};

export type StoreContextTipi = {
  urunler: Urun[];
  kategoriler: Kategori[];
  hazir: boolean;

  urunEkle: (veri: Omit<Urun, "id" | "createdAt">) => Urun;
  urunGuncelle: (id: string, veri: Partial<Omit<Urun, "id">>) => void;
  urunSil: (id: string) => void;

  kategoriEkle: (veri: Omit<Kategori, "id" | "sira">) => Kategori;
  kategoriGuncelle: (id: string, veri: Partial<Omit<Kategori, "id">>) => void;
  kategoriSil: (id: string) => void;

  kategoriBul: (id: string) => Kategori | undefined;
  urunleriKategoriyeGore: (kategoriId: string) => Urun[];

  fabrikaAyarlarinaDon: () => void;
};