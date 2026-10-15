import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const b = await req.json();
    const sql = getDb();

    await sql`
      UPDATE urunler SET
        isim = COALESCE(${b.isim ?? null}, isim),
        kategori_id = COALESCE(${b.kategoriId ?? null}, kategori_id),
        fiyat = COALESCE(${b.fiyat ?? null}, fiyat),
        sembol = COALESCE(${b.sembol ?? null}, sembol),
        gorsel_url = COALESCE(${b.gorselUrl ?? null}, gorsel_url),
        etiket = COALESCE(${b.etiket ?? null}, etiket),
        aciklama = COALESCE(${b.aciklama ?? null}, aciklama)
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/urunler hatası:", err);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM urunler WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/urunler hatası:", err);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}