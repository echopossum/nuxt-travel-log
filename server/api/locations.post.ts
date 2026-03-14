import db from "~/lib/db";
import { location, InsertLocation } from "~/lib/db/schema";

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

  const [created] = await db
    .insert(location)
    .values({
      ...result.data,
      userId: event.context.user.id,
      slug: result.data.name.replaceAll(" ", "-").toLowerCase(),
    })
    .returning();

  return created;
});
