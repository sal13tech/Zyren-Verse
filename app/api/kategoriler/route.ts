import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const sql = getDb();

    await sql`
      INSERT INTO kategoriler (id, isim, sira, sembol)
      VALUES (${b.id}, ${b.isim}, ${b.sira}, ${b.sembol ?? null})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/kategoriler hatası:", err);
    return NextResponse.json({ error: "Eklenemedi" }, { status: 500 });
  }
}