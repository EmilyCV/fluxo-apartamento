export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export type FirestoreTimestamp = Timestamp | Date | string | null;
