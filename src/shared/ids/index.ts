import { v7 as uuidv7 } from 'uuid';

/** App-generated, time-sortable id (UUIDv7) for every new record. */
export function newId(): string {
  return uuidv7();
}
