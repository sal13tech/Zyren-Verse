import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Vercel Blob'a yükle
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true, // Aynı isimli dosyalar çakışmasın diye sonuna rastgele harf ekler
    });

    // Yüklenen resmin internet linkini geri döndür
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Yükleme hatası:", error);
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}