import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SEED_KATEGORILER, SEED_URUNLER } from "@/lib/seed";

export async function POST() {
  try {
    const sql = getDb();

    await sql`DELETE FROM urunler`;
    await sql`DELETE FROM kategoriler`;

    for (const k of SEED_KATEGORILER) {
      await sql`
        INSERT INTO kategoriler (id, isim, sira, sembol)
        VALUES (${k.id}, ${k.isim}, ${k.sira}, ${k.sembol ?? null})
      `;
    }

    for (const u of SEED_URUNLER) {
      await sql`
        INSERT INTO urunler (
          id, isim, kategori_id, fiyat, sembol,
          gorsel_url, etiket, aciklama, created_at
        ) VALUES (
          ${u.id}, ${u.isim}, ${u.kategoriId}, ${u.fiyat}, ${u.sembol},
          ${u.gorselUrl ?? null}, ${u.etiket ?? null}, ${u.aciklama}, ${u.createdAt}
        )
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/sifirla hatası:", err);
    return NextResponse.json({ error: "Sıfırlanamadı" }, { status: 500 });
  }
}