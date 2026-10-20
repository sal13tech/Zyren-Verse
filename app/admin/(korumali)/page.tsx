"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/contexts/StoreContext";

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const PARA = (n: number) => TRY_FORMATTER.format(n);

export default function AdminDashboard() {
  const { urunler, kategoriler, hazir } = useStore();

  const istatistikler = useMemo(() => {
    const toplamUrun = urunler.length;
    const toplamKategori = kategoriler.length;
    
    const potansiyelCiro = urunler.reduce((t, u) => t + (u.fiyat * (u.stok || 0)), 0);
    const toplamDeger = urunler.reduce((t, u) => t + u.fiyat, 0);
    const ortalamaFiyat = toplamUrun > 0 ? Math.round(toplamDeger / toplamUrun) : 0;
    
    const toplamStok = urunler.reduce((t, u) => t + (u.stok || 0), 0);
    const stoktaOlan = urunler.filter((u) => u.stok > 3).length;
    const kritikStok = urunler.filter((u) => u.stok > 0 && u.stok <= 3).length;
    const tukenenler = urunler.filter((u) => u.stok === 0).length;

    const kategoriDagilimi = kategoriler.map(kat => {
      const katUrunler = urunler.filter(u => u.kategoriId === kat.id);
      const katStok = katUrunler.reduce((t, u) => t + (u.stok || 0), 0);
      return {
        ...kat,
        urunSayisi: katUrunler.length,
        stokSayisi: katStok,
        yuzde: toplamUrun > 0 ? Math.round((katUrunler.length / toplamUrun) * 100) : 0
      };
    }).sort((a, b) => b.urunSayisi - a.urunSayisi);

    const sonEklenenler = [...urunler].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

    return {
      toplamUrun,
      toplamKategori,
      potansiyelCiro,
      ortalamaFiyat,
      toplamStok,
      stoktaOlan,
      kritikStok,
      tukenenler,
      kategoriDagilimi,
      sonEklenenler
    };
  }, [urunler, kategoriler]);

  if (!hazir) {
    return <div className="p-16 text-center text-sm text-gray-400 tracking-widest uppercase">YÜKLENİYOR…</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      {/* KARŞILAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-white/80 to-white/40 border border-white/80 rounded-2xl p-6 md:p-8 mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_45px_rgba(30,30,30,0.05)]">
        <div>
          <h2 className="m-0 text-2xl md:text-3xl font-serif text-[#171717] tracking-wide mb-2">Genel Bakış 👋</h2>
          <p className="m-0 text-[#7d7d7d] text-sm leading-relaxed">Mağazanın anlık durumu, envanter sağlığı ve son hareketler.</p>
        </div>
        <div className="bg-[#a88a56]/10 text-[#8f733f] px-4 py-2 rounded-full text-xs font-bold tracking-widest shrink-0">
          {new Date().toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* METRİKLER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* CİRO */}
        <div className="bg-gradient-to-br from-white/90 to-[#f0ebe1]/80 border border-[#a88a56]/30 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8f8a82] text-[10px] font-bold tracking-widest uppercase">Potansiyel Ciro</span>
            <span className="text-xl opacity-80">💰</span>
          </div>
          <div className="font-serif text-2xl md:text-3xl text-[#8f733f] font-medium leading-none mb-2">{PARA(istatistikler.potansiyelCiro)}</div>
          <div className="text-[#999] text-[11px] font-medium">stoktaki ürünlerin toplam değeri</div>
        </div>

        {/* ÜRÜN */}
        <div className="bg-white/60 border border-white/85 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8f8a82] text-[10px] font-bold tracking-widest uppercase">Toplam Ürün</span>
            <span className="text-xl opacity-80">🏷️</span>
          </div>
          <div className="font-serif text-2xl md:text-3xl text-[#171717] font-medium leading-none mb-2">{istatistikler.toplamUrun}</div>
          <div className="text-[#999] text-[11px] font-medium">{istatistikler.toplamKategori} farklı kategoride</div>
        </div>

        {/* STOK */}
        <div className="bg-white/60 border border-white/85 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8f8a82] text-[10px] font-bold tracking-widest uppercase">Toplam Stok</span>
            <span className="text-xl opacity-80">📦</span>
          </div>
          <div className="font-serif text-2xl md:text-3xl text-[#171717] font-medium leading-none mb-2">
            {istatistikler.toplamStok} <span className="text-sm text-gray-400 font-normal">adet</span>
          </div>
          <div className="text-[#999] text-[11px] font-medium">depodaki fiziksel ürün sayısı</div>
        </div>

        {/* ORTALAMA */}
        <div className="bg-white/60 border border-white/85 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8f8a82] text-[10px] font-bold tracking-widest uppercase">Ortalama Fiyat</span>
            <span className="text-xl opacity-80">💎</span>
          </div>
          <div className="font-serif text-2xl md:text-3xl text-[#171717] font-medium leading-none mb-2">{PARA(istatistikler.ortalamaFiyat)}</div>
          <div className="text-[#999] text-[11px] font-medium">ürün başına düşen ortalama</div>
        </div>
      </div>

      {/* ORTA ALAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* KATEGORİ GRAFİĞİ */}
        <div className="lg:col-span-2 bg-white/60 border border-white/85 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="m-0 mb-6 font-serif text-lg text-[#171717] font-semibold flex justify-between items-center">Kategori Dağılımı</h3>
          <div className="flex flex-col gap-4">
            {istatistikler.kategoriDagilimi.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz kategori yok.</p>
            ) : (
              istatistikler.kategoriDagilimi.map((kat) => (
                <div key={kat.id}>
                  <div className="flex justify-between text-xs font-semibold text-[#444] mb-1.5">
                    <span>{kat.sembol} {kat.isim}</span>
                    <span>{kat.urunSayisi} Ürün · {kat.stokSayisi} Stok</span>
                  </div>
                  <div className="h-2 bg-[#171717]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#171717] rounded-full transition-all duration-1000" style={{ width: `${kat.yuzde}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ENVANTER SAĞLIĞI */}
        <div className="bg-white/60 border border-white/85 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
          <h3 className="m-0 mb-6 font-serif text-lg text-[#171717] font-semibold">Envanter Sağlığı</h3>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#2e7d32]/10 text-[#2e7d32] text-sm font-semibold">
              <span>✅ Yeterli Stok</span>
              <span className="font-serif text-lg font-bold">{istatistikler.stoktaOlan}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#e65100]/10 text-[#e65100] text-sm font-semibold">
              <span>⚠️ Kritik Stok (≤3)</span>
              <span className="font-serif text-lg font-bold">{istatistikler.kritikStok}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#c62828]/10 text-[#c62828] text-sm font-semibold">
              <span>❌ Tükenen Ürünler</span>
              <span className="font-serif text-lg font-bold">{istatistikler.tukenenler}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
             <Link href="/admin/urunler" className="text-xs text-[#8f733f] font-bold no-underline hover:underline">
               Envanteri Yönet ↗
             </Link>
          </div>
        </div>
      </div>

      {/* SON EKLENEN ÜRÜNLER */}
      <h3 className="m-0 mb-4 font-serif text-xl text-[#171717] font-medium tracking-wide">Son Eklenen Ürünler</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {istatistikler.sonEklenenler.length === 0 ? (
          <div className="col-span-full p-5 text-sm text-gray-400 bg-white/50 rounded-xl">Henüz ürün eklenmemiş.</div>
        ) : (
          istatistikler.sonEklenenler.map((urun) => (
            <Link href="/admin/urunler" key={urun.id} className="group flex flex-col bg-white/70 border border-white/90 rounded-2xl overflow-hidden no-underline text-inherit hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="h-[120px] bg-[#f9f9f9] flex items-center justify-center text-4xl border-b border-black/5 overflow-hidden">
                {urun.gorselUrl ? (
                  <img src={urun.gorselUrl} alt={urun.isim} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  urun.sembol
                )}
              </div>
              <div className="p-3">
                <h4 className="m-0 mb-1 font-serif text-[15px] font-semibold text-[#171717] truncate">{urun.isim}</h4>
                <p className="m-0 text-[11px] text-[#8f733f] font-bold">{PARA(urun.fiyat)} · Stok: {urun.stok}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* HIZLI ERİŞİM */}
      <h3 className="m-0 mb-4 font-serif text-xl text-[#171717] font-medium tracking-wide">Hızlı İşlemler</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/urunler" className="flex items-center gap-4 p-5 bg-white/55 border border-[#141414]/10 rounded-2xl no-underline text-[#333] hover:bg-white transition-colors">
          <span className="text-2xl">📦</span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Yeni Ürün Ekle</span>
            <span className="text-[11px] text-gray-400 font-medium">Kataloğu güncelle</span>
          </span>
        </Link>
        <Link href="/admin/kategoriler" className="flex items-center gap-4 p-5 bg-white/55 border border-[#141414]/10 rounded-2xl no-underline text-[#333] hover:bg-white transition-colors">
          <span className="text-2xl">🗂️</span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Kategori Düzenle</span>
            <span className="text-[11px] text-gray-400 font-medium">Vitrini organize et</span>
          </span>
        </Link>
        <Link href="/admin/ayarlar" className="flex items-center gap-4 p-5 bg-white/55 border border-[#141414]/10 rounded-2xl no-underline text-[#333] hover:bg-white transition-colors">
          <span className="text-2xl">⚙️</span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Sistem Ayarları</span>
            <span className="text-[11px] text-gray-400 font-medium">Yedekle ve sıfırla</span>
          </span>
        </Link>
      </div>
    </div>
  );
}