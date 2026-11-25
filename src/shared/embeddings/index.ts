/**
 * Port for turning text into embedding vectors (ADR-0003).
 * Callers depend only on this interface; the provider adapter lives beside it and tests use a fake.
 */
export interface Embedder {
  /** Provider model id, stored with every embedding so a model change can be detected. */
  readonly model: string;
  /** Length of every returned vector. */
  readonly dimensions: number;
  /** Embed a batch of texts; returns one vector per input, in order. */
  embed(texts: string[]): Promise<number[][]>;
}
