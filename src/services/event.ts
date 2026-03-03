import { deleteHelper, getHelper, postHelper, updateHelper } from "@/api/crud";
import endpoints from "@/config/endpoints";
import type { EventGet, EventPost, EventUpdate } from "@/types/api/event";

const { event } = endpoints;

export const getAllEvents = async (termId: string, year?: string) => {
  return getHelper<EventGet[]>(event.getAll(termId, year));
};
export const get30daysEvents = async () => {
  return getHelper<EventGet[]>(event["30daysEvents"]);
};

export const createEventFn = async (data: EventPost) => {
  return postHelper(event.create, data);
};

export const updateEventFn = async (update: EventUpdate) => {
  return updateHelper(event.update(update.id), update.data);
};

export const deleteEventFn = async (id: string) => {
  return deleteHelper(event.delete(id));
};
