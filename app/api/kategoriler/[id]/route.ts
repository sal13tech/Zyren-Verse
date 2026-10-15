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
      UPDATE kategoriler SET
        isim = COALESCE(${b.isim ?? null}, isim),
        sira = COALESCE(${b.sira ?? null}, sira),
        sembol = COALESCE(${b.sembol ?? null}, sembol)
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/kategoriler hatası:", err);
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
    await sql`DELETE FROM kategoriler WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/kategoriler hatası:", err);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}