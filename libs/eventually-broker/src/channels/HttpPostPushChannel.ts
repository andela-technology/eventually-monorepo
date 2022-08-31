import { log, Payload } from "@rotorsoft/eventually";
import axios from "axios";
import { CommittableHttpStatus } from "../cluster";
import { PushChannel } from "../interfaces";
import { PushEvent, PushResponse } from "../types";
import { toAxiosRequestHeaders } from "../utils";

const TIMEOUT = 10000;

const push = async (
  url: string,
  event: PushEvent,
  headers?: Payload
): Promise<PushResponse> => {
  try {
    const { status, statusText } = await axios.post(url, event, {
      timeout: TIMEOUT,
      headers: headers && toAxiosRequestHeaders(headers)
    });
    return { statusCode: status, statusText };
  } catch (error) {
    log().error(error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const { status, statusText, data } = error.response;
        return {
          statusCode: status,
          statusText,
          details: data
            ? `${data.message} ${
                data.details ? JSON.stringify(data.details) : ""
              }`
            : undefined
        };
      }
      return {
        statusCode: 503,
        statusText: error.code
      };
    }
    return {
      statusCode: 503,
      statusText: "Internal Server Error",
      details: error instanceof Error ? error.message : JSON.stringify(error)
    };
  }
};

export const HttpPostPushChannel = (
  endpoint: URL,
  headers?: Payload
): PushChannel => {
  return {
    label: "",
    init: () => undefined,
    push: async (events) => {
      let lastCode = 200;
      while (events.length) {
        const event = events.shift();
        event.response = await push(endpoint.href, event, headers);
        lastCode = event.response.statusCode;
        if (!CommittableHttpStatus.includes(lastCode)) break;
      }
      return lastCode;
    }
  };
};
