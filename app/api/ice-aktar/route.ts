import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { urunler, kategoriler } = await req.json();
    
    if (!Array.isArray(urunler) || !Array.isArray(kategoriler)) {
      return NextResponse.json({ error: "Geçersiz veri formatı" }, { status: 400 });
    }

    const sql = getDb();

    // 1. Mevcut verileri temizle (Sıralama önemli: önce ürünler silinmeli)
    await sql`DELETE FROM urunler`;
    await sql`DELETE FROM kategoriler`;

    // 2. Kategorileri ekle
    for (const k of kategoriler) {
      await sql`
        INSERT INTO kategoriler (id, isim, sira, sembol)
        VALUES (${k.id}, ${k.isim}, ${k.sira ?? 0}, ${k.sembol ?? null})
      `;
    }

    // 3. Ürünleri ekle
    for (const u of urunler) {
      await sql`
        INSERT INTO urunler (
          id, isim, kategori_id, fiyat, sembol,
          gorsel_url, etiket, aciklama, created_at
        ) VALUES (
          ${u.id}, ${u.isim}, ${u.kategoriId}, ${u.fiyat}, ${u.sembol},
          ${u.gorselUrl ?? null}, ${u.etiket ?? null}, ${u.aciklama}, ${u.createdAt ?? Date.now()}
        )
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("İçe aktarma hatası:", err);
    return NextResponse.json({ error: "Yedek yüklenemedi" }, { status: 500 });
  }
}