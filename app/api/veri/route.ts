import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    const [urunler, kategoriler] = await Promise.all([
      sql`
        SELECT
          id, isim, kategori_id as "kategoriId", fiyat, sembol,
          gorsel_url as "gorselUrl", etiket, aciklama, created_at as "createdAt", stok
        FROM urunler
        ORDER BY created_at DESC
      `,
      sql`
        SELECT id, isim, sira, sembol
        FROM kategoriler
        ORDER BY sira ASC
      `,
    ]);

    return NextResponse.json({ urunler, kategoriler });
  } catch (err) {
    console.error("GET /api/veri hatası:", err);
    return NextResponse.json({ error: "Veri yüklenemedi" }, { status: 500 });
  }
}