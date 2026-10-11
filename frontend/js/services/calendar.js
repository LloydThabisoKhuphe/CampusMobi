/* =============================================================================
   services/calendar.js
   -----------------------------------------------------------------------------
   Thin wrapper around the calendar endpoints.
   ============================================================================= */

import { apiRequest } from "./api.js";

export function getEvents() {
  return apiRequest("/calendar");
}

export function addEvent(date, time, title) {
  return apiRequest("/calendar", { method: "POST", body: { date, time, title } });
}

export function deleteEvent(date, eventId) {
  return apiRequest(`/calendar/${encodeURIComponent(date)}/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
  });
}
