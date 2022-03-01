import { CommittedEvent, Payload } from "@rotorsoft/eventually";
import { Chance } from "chance";
import { Pool } from "pg";
import { PostgresStore, config } from "..";
import { event, sleep } from "./utils";

const table = "test";

const db = PostgresStore(table);

const chance = new Chance();
const a1 = chance.guid();
const a2 = chance.guid();
const a3 = chance.guid();
let created_before: Date;
let created_after: Date;

describe("PostgresStore", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool(config.pg);
    await pool.query(`DROP TABLE IF EXISTS ${table};`);
    await db.init();
    await db.init();
    await db.commit(a1, [event("test1", { value: "1" })], {
      correlation: "",
      causation: {}
    });
    created_after = new Date();
    await sleep(1000);

    await db.commit(a1, [event("test1", { value: "2" })], {
      correlation: "",
      causation: {}
    });
    await db.commit(a2, [event("test2", { value: "3" })], {
      correlation: "",
      causation: {}
    });
    await db.commit(a3, [event("test1", { value: "4" })], {
      correlation: "",
      causation: {}
    });

    await db.commit(a1, [event("test2", { value: "5" })], {
      correlation: "",
      causation: {}
    });

    await sleep(1000);
    created_before = new Date();
    await sleep(1000);

    await db.commit(
      a1,
      [
        event("test3", { value: "1" }),
        event("test3", { value: "2" }),
        event("test3", { value: "3" })
      ],
      { correlation: "", causation: {} },
      undefined
    );
  });

  afterAll(async () => {
    await pool.end();
    await db.close();
    await db.close();
  });

  it("should commit events", async () => {
    let first: number,
      count = 0;
    await db.query(
      (e) => {
        first = first || e.id;
        count++;
      },
      { stream: a1 }
    );
    expect(first).toBeGreaterThan(0);
    expect(count).toBe(6);
  });

  it("should commit events array", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query(
      (e) => {
        events.push(e);
      },
      { stream: a1 }
    );
    const l = events.length;
    expect(l).toBeGreaterThan(2);
    expect(events[l - 1].data).toStrictEqual({ value: "3" });
    expect(events[l - 2].data).toStrictEqual({ value: "2" });
    expect(events[l - 3].data).toStrictEqual({ value: "1" });
  });

  it("should throw concurrency error", async () => {
    await expect(
      db.commit(a1, [event("test2")], { correlation: "", causation: {} }, 1)
    ).rejects.toThrowError("Concurrency Error");
  });

  it("should read stream with after", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query((e) => events.push(e), { after: 2, limit: 2 });
    expect(events[0].id).toBe(3);
    expect(events.length).toBe(2);
  });

  it("should read stream by name", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query((e) => events.push(e), { names: ["test1"], limit: 5 });
    expect(events[0].name).toBe("test1");
    expect(events.length).toBeGreaterThanOrEqual(3);
    events.map((evt) => expect(evt.name).toBe("test1"));
  });

  it("should read stream with limit", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query((e) => events.push(e), { limit: 5 });
    expect(events.length).toBe(5);
  });

  it("should read stream with before and after", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query((e) => events.push(e), { after: 2, before: 4 });
    expect(events.length).toBe(1);
  });

  it("should read stream with before and after created", async () => {
    const events: CommittedEvent<string, Payload>[] = [];
    await db.query((e) => events.push(e), {
      stream: a1,
      created_after,
      created_before
    });
    expect(events.length).toBe(2);
  });

  it("should get store stats", async () => {
    const stats = await db.stats();
    expect(stats).toBeDefined();
  });
});
