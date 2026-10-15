import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (_sql) return _sql;

  const url =
    process.env.DATABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL;

  if (!url) {
    throw new Error(
      "Veritabanı bağlantı adresi yok. DATABASE_URL env var'ını ekle.",
    );
  }

  _sql = neon(url);
  return _sql;
}
