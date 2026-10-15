import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const sql = getDb();

    await sql`
      INSERT INTO urunler (
        id, isim, kategori_id, fiyat, sembol,
        gorsel_url, etiket, aciklama, created_at
      ) VALUES (
        ${b.id}, ${b.isim}, ${b.kategoriId}, ${b.fiyat}, ${b.sembol},
        ${b.gorselUrl ?? null}, ${b.etiket ?? null}, ${b.aciklama}, ${b.createdAt}
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/urunler hatası:", err);
    return NextResponse.json({ error: "Eklenemedi" }, { status: 500 });
  }
}