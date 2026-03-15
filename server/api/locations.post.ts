import { type DrizzleError } from "drizzle-orm";
import slugify from "slug";
import { InsertLocation } from "~/lib/db/schema";
import {
  findLocationByName,
  findUniqueSlug,
  insertLocation,
} from "~/lib/db/queries/locations";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
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

  const existingLocation = !!(await findLocationByName(
    result.data,
    event.context.user.id,
  ));

  if (existingLocation) {
    return sendError(
      event,
      createError({
        statusCode: 409,
        statusMessage: "A location with that name already exists",
      }),
    );
  }

  const slug = await findUniqueSlug(slugify(result.data.name));
  console.log(`Unique Slug is:${slug}`);

  try {
    return await insertLocation(result.data, slug, event.context.user.id);
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
