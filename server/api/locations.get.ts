import { findLocations } from "~/lib/db/queries/locations";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async (event) => {
  return findLocations(event.context.user.id);
});
