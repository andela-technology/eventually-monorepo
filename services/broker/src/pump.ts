import {
  CommittedEvent,
  log,
  Payload,
  store,
  subscriptions,
  TriggerCallback
} from "@rotorsoft/eventually";
import axios from "axios";

const BATCH_SIZE = 100;

type Response = {
  status: number;
  statusText: string;
};

type Stats = {
  trigger: { position: number; reason: "commit" | "retry" };
  after: number;
  last: number;
  batches: number;
  total: number;
  events: Record<string, { count: number; response: Record<number, number> }>;
};

const post = async (
  event: CommittedEvent<string, Payload>,
  endpoint: string,
  streams: RegExp,
  names: RegExp
): Promise<Response> => {
  if (streams.test(event.stream) && names.test(event.name)) {
    try {
      const response = await axios.post(endpoint, event);
      const { status, statusText } = response;
      return { status, statusText };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { status, statusText } = error.response;
        return { status, statusText };
      } else {
        log().error(error);
        // TODO: check network errors to return 503 or 500
        return { status: 503, statusText: error.message };
      }
    }
  }
  return { status: 204, statusText: "Not Matched" };
};

/**
 * Pumps committed events from streams to endpoints
 * @param event triggering event
 * @param channel the streaming channel
 * @param endpoint HTTP POST endpoint
 * @param streams streams regex to match
 * @param names names regex to match
 */
export const pump: TriggerCallback = async (trigger, sub): Promise<void> => {
  const streams = RegExp(sub.streams);
  const names = RegExp(sub.names);

  let count = BATCH_SIZE;
  const stats: Stats = {
    trigger,
    after: sub.position,
    last: sub.position,
    batches: 0,
    total: 0,
    events: {}
  };
  while (count === BATCH_SIZE) {
    stats.batches++;
    const events: CommittedEvent<string, Payload>[] = [];
    count = await store().query((e) => events.push(e), {
      after: sub.position,
      limit: BATCH_SIZE
    });
    for (const e of events) {
      const response = await post(e, sub.endpoint, streams, names);
      const { status } = response;

      stats.total++;
      const event = (stats.events[e.name] = stats.events[e.name] || {
        count: 0,
        response: {}
      });
      event.count++;
      event.response[status] = (event.response[status] || 0) + 1;

      if ([429, 503, 504].includes(status)) {
        // TODO: handle retries - how to trigger again with backoff
        // 429 - Too Many Requests
        // 503 - Service Unavailable
        // 504 - Gateway Timeout
        break;
      } else if (status === 409) {
        // concurrency error - ignore by default - TODO: by sub config?
      } else if (![200, 204].includes(status)) break; // break on errors

      // update position
      await subscriptions().commit(sub.id, e.id);
      sub.position = stats.last = e.id;
    }
  }
  log().info(
    "blue",
    sub.id,
    `${sub.channel} -> ${sub.endpoint}`,
    JSON.stringify(stats)
  );
};
