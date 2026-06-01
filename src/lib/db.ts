import { getRequestContext } from "@cloudflare/next-on-pages";

export function db(): D1Database {
  try {
    return getRequestContext().env.DB as D1Database;
  } catch {
    throw new Error("D1 DB not available in this environment");
  }
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const result = await db().prepare(sql).bind(...params).first<T>();
  return result ?? null;
}

export async function queryAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await db().prepare(sql).bind(...params).all<T>();
  return result.results;
}

export async function execute(sql: string, params: unknown[] = []): Promise<D1Result> {
  return db().prepare(sql).bind(...params).run();
}
