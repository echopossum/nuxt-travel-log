import { eq, and, type DrizzleError } from "drizzle-orm";
import slugify from "slug";
import db from "~/lib/db";
import { customAlphabet } from "nanoid";
import { location, InsertLocation } from "~/lib/db/schema";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      }),
    );
  }

  const result = await readValidatedBody(event, InsertLocation.safeParse);

  if (!result.success) {
    const statusMessage = result.error.issues
      .map((issue) => `${issue.path.join("")}: ${issue.message} `)
      .join("; ");

    return sendError(
      event,
      createError({
        statusCode: 422,
        statusMessage,
      }),
    );
  }

  const existingLocation = !!(await db.query.location.findFirst({
    where: and(
      eq(location.name, result.data.name),
      eq(location.userId, event.context.user.id),
    ),
  }));

  if (existingLocation) {
    return sendError(
      event,
      createError({
        statusCode: 409,
        statusMessage: "A location with that name already exists",
      }),
    );
  }

  let slug = slugify(result.data.name);
  let existing = !!(await db.query.location.findFirst({
    where: eq(location.slug, slug),
  }));

  console.log(existing);

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    existing = !!(await db.query.location.findFirst({
      where: eq(location.slug, idSlug),
    }));
    console.log(existing);
    if (!existing) {
      slug = idSlug;
    }
  }

  console.log(`result is ${slug}`);

  try {
    const [created] = await db
      .insert(location)
      .values({
        ...result.data,
        userId: event.context.user.id,
        slug,
      })
      .returning();
    return created;
  } catch (e) {
    const error = e as DrizzleError;
    if (
      error.cause?.message ===
      "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: location.slug"
    ) {
      return sendError(
        event,
        createError({
          statusCode: 409,
          statusMessage:
            "Slug must be unique(the location name is used for the slug)",
        }),
      );
    }
    throw error;
  }
});
