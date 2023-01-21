import {
  AllQuery,
  CommittedEvent,
  CommittedEventMetadata,
  Message,
  Messages,
  ProjectionResults,
  Projection,
  Snapshot,
  SnapshotsQuery,
  State,
  ProjectionRecord,
  ProjectionState
} from "../types/messages";
import { Disposable, Seedable } from "./generic";

export type StoreStat = {
  name: string;
  count: number;
  firstId?: number;
  lastId?: number;
  firstCreated?: Date;
  lastCreated?: Date;
};

/**
 * Stores events in streams
 */
export interface Store extends Disposable, Seedable {
  /**
   * Queries the event store
   * @param callback callback predicate
   * @param query optional query values
   * @returns number of records
   */
  query: (
    callback: (event: CommittedEvent) => void,
    query?: AllQuery
  ) => Promise<number>;

  /**
   * Commits message into stream of aggregate id
   * @param stream stream name
   * @param events array of uncommitted events
   * @param metadata metadata
   * @param expectedVersion optional aggregate expected version to provide optimistic concurrency, raises concurrency exception when not matched
   * @returns array of committed events
   */
  commit: <E extends Messages>(
    stream: string,
    events: Message<E>[],
    metadata: CommittedEventMetadata,
    expectedVersion?: number
  ) => Promise<CommittedEvent<E>[]>;

  /**
   * Gets store stats
   */
  stats: () => Promise<StoreStat[]>;

  /** Get stored event handler watermarks */
  get_watermarks: () => Promise<Record<string, number>>;
  /** Store event handler watermarks */
  set_watermarks: (watermarks: Record<string, number>) => Promise<void>;
}

export interface SnapshotStore extends Disposable, Seedable {
  /**
   * Snapshot threshold
   */
  threshold: number;

  /**
   * Reads snapshot from store for stream
   */
  read: <S extends State, E extends Messages>(
    stream: string
  ) => Promise<Snapshot<S, E>>;

  /**
   * Commits a snapshot into stream for stream
   * @param data the current state to be sotred
   */
  upsert: <S extends State, E extends Messages>(
    stream: string,
    state: Snapshot<S, E>
  ) => Promise<void>;

  /**
   * Queries the snapshot store
   * @param query query parameters
   * @returns array of snapshots
   */
  query: <S extends State, E extends Messages>(
    query: SnapshotsQuery
  ) => Promise<Snapshot<S, E>[]>;
}

export interface ProjectorStore extends Disposable, Seedable {
  /**
   * Loads projection records by id
   * @param ids the record ids
   * @returns the stored records by id
   */
  load: <S extends ProjectionState>(
    ids: string[]
  ) => Promise<Record<string, ProjectionRecord<S>>>;

  /**
   * Commits projection with basic idempotence check
   * @param projection the projection filters
   * @param watermark the new watermark - ignored when new watermark <= stored watermark
   * @returns the projection results
   */
  commit: <S extends ProjectionState>(
    projection: Projection<S>,
    watermark: number
  ) => Promise<ProjectionResults<S>>;
}
