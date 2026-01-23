export type SearchOutboxMessage = {
  eventId: string;
  type: string;
  entityId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};
