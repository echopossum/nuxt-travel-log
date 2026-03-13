import { InsertLocation } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
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

  return result.data;
});
