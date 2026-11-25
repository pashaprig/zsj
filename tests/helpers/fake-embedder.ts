import { createHash } from 'node:crypto';
import type { Embedder } from '@/shared/embeddings';

/**
 * Deterministic Embedder for tests: the same text always yields the same unit vector,
 * different texts yield different vectors. Never touches the network.
 */
export function createFakeEmbedder(dimensions = 8): Embedder {
  return {
    model: 'fake-embedder',
    dimensions,
    async embed(texts) {
      return texts.map((text) => {
        const digest = createHash('sha256').update(text).digest();
        const raw = Array.from({ length: dimensions }, (_, i) => (digest[i % digest.length]! / 255) * 2 - 1);
        const norm = Math.hypot(...raw) || 1;
        return raw.map((v) => v / norm);
      });
    },
  };
}
