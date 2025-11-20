import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';

import { config } from './env.js';
import { embeddingClient } from './embed.js';

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'taklip_knowledge';

const baseConfig: { url: string; apiKey?: string } = {
  url: config.qdrant.url,
  ...(config.qdrant.apiKey ? { apiKey: config.qdrant.apiKey } : {}),
};

export const qdrantClient = new QdrantClient(baseConfig);

async function ensureCollectionExists(): Promise<void> {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some((collection) => collection.name === COLLECTION_NAME);

  if (!exists) {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: Number.parseInt(config.embedding.dimensions ?? '1536', 10),
        distance: 'Cosine',
      },
    });
  }
}

export async function getQdrantVectorStore(): Promise<QdrantVectorStore> {
  await ensureCollectionExists();

  return QdrantVectorStore.fromExistingCollection(embeddingClient, {
    ...baseConfig,
    collectionName: COLLECTION_NAME,
    client: qdrantClient,
  });
}

export const qdrantCollectionName = COLLECTION_NAME;
