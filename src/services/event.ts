import { getHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { EventGet } from "@/types/api/event";

export const get30daysEvents = async () => {
  return getHelper<EventGet[]>(endpoints.event["30daysEvents"]);
};
