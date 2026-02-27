import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { EventGet } from "@/types/api/setup/event";

export const get30daysEvents = async () => {
  return getHelper<EventGet[]>(endpoints.notice["30daysEvents"]);
};
