import { and, eq } from "drizzle-orm";
import db from "..";
import type { InsertLocation } from "../schema";
import { location } from "../schema";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export async function findLocationByName(
  existing: InsertLocation,
  userId: number,
) {
  return db.query.location.findFirst({
    where: and(eq(location.name, existing.name), eq(location.userId, userId)),
  });
}

export async function findLocationBySlug(slug: string) {
  return db.query.location.findFirst({
    where: eq(location.slug, slug),
  });
}

export async function findUniqueSlug(slug: string) {
  let existing = !!(await findLocationBySlug(slug));

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    existing = !!(await findLocationBySlug(idSlug));
    console.log(existing);
    if (!existing) {
      return idSlug;
    }
  }

  return slug;
}

export async function insertLocation(
  insertable: InsertLocation,
  slug: string,
  userId: number,
) {
  const created = db
    .insert(location)
    .values({
      ...insertable,
      userId,
      slug,
    })
    .returning();
  return created;
}

export async function findLocations(userId: number) {
  return db.query.location.findMany({
    where: eq(location.userId, userId),
  });
}
