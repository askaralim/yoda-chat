// Store/retrieve vectors from Qdrant

import { extractTextFromHTML } from "../utils/extract.js";
import { chunkText } from "./chunkingService.js";
import { embeddingClient } from "../config/embed";
import { getQdrantVectorStore, qdrantClient, qdrantCollectionName } from "../config/qdrant.js";
import { config } from "../config/env.js";
import { hashText } from "../utils/hash.js";

export interface RetrievedChunk {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export async function findSimilarChunks(query: string, topK = Number.parseInt(config.vector.topK, 10) || 3): Promise<RetrievedChunk[]> {
  const vectorStore = await getQdrantVectorStore();
  const vector = await embeddingClient.embedQuery(query);

  const results = await vectorStore.similaritySearchVectorWithScore(vector, topK);
  const minScore = Number.parseFloat(config.vector.minScore || "0");

  const filtered = results.filter(([, score]) => typeof score === "number" && score >= minScore);

  if (filtered.length === 0) {
    console.log(`[RAG] No chunks met similarity threshold (${minScore}) for query: ${query}`);
  }

  return filtered.map(([doc, score]) => ({
    content: doc.pageContent,
    metadata: doc.metadata ?? {},
    score,
  }));
}

export async function getContextFromChunks(query: string, topK = 3): Promise<string> {
  const chunks = await findSimilarChunks(query, topK);
  return chunks.map((chunk) => chunk.content).join("\n\n");
}

type KnowledgeItem = Record<string, any> & {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  type?: "content" | "brand" | string;
};

export async function buildKnowledgeBase(items: KnowledgeItem[]): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    console.warn("No articles provided for knowledge base ingestion");
    return;
  }

  const vectorStore = await getQdrantVectorStore();

  for (const item of items) {
    if (!item?.description) {
      continue;
    }

    const text = extractTextFromHTML(item.description);
    if (!text?.trim()) {
      continue;
    }

    const contentHash = hashText(text);
    const itemType = item.type || "content";
    const itemId = String(item.id ?? "");

    const existing = await qdrantClient.scroll(qdrantCollectionName, {
      limit: 1,
      filter: {
        must: [
          { key: "metadata.articleId", match: { value: itemId } },
          { key: "metadata.contentHash", match: { value: contentHash } },
        ],
      },
      with_payload: true,
    });

    if (existing.points && existing.points.length > 0) {
      console.log(`[SKIP] ${itemType} ${itemId} already ingested (content hash match)`);
      continue;
    }

    const baseMetadata = {
      articleId: itemId,
      title: item.title || item.name || "",
      contentType: itemType,
      source: item.source || "mysql",
      contentHash,
      ingestedAt: new Date().toISOString(),
    } satisfies Record<string, any>;

    const docs = await chunkText(text, baseMetadata);

    if (docs.length === 0) {
      continue;
    }

    await vectorStore.addDocuments(docs);
    console.log(`[OK] Uploaded ${itemType} ${baseMetadata.title || baseMetadata.articleId} to Qdrant`);
  }

  console.log(`[OK] Ingestion finished. Processed ${items.length} items.`);
}

// export async function buildKnowledgeBase(articles: any[]) {
//     const collections = await qdrantClient.getCollections();
//     const exists = collections.collections.some(c => c.name === "knowledge");

//     if (!exists) {
//         await qdrantClient.createCollection("knowledge", {
//             vectors: { size: parseInt(config.embedding.dimensions), distance: "Cosine" },
//         });
//     }

//     const points: any[] = [];
//     let chunkCounter = 0; // Global counter for unique numeric IDs

//     for (const article of articles) {
//         const text = extractTextFromHTML(article.description);

//         const chunks = await chunkText(text, article.title);

//         for (let i = 0; i < chunks.length; i++) {
//             const chunk = chunks[i];
//             if (chunk) {
//                 const embedding = await getEmbedding(chunk);

//                 points.push({
//                     id: chunkCounter++,
//                     vector: embedding,
//                     payload: {
//                         articleId: article.id, // Store article ID in payload
//                         chunkIndex: i, // Store chunk index in payload
//                         source: article.name || article.title,
//                         text: chunk,
//                     },
//                 });
//             }
//         }
//     }
//     await qdrantClient.upsert("knowledge", { points });
//     console.log("✅ Knowledge base built successfully");
// }

export async function getKnowledgeBase(id: string): Promise<string> {
  const existing = await qdrantClient.scroll(qdrantCollectionName, {
    filter: {
      must: [
        { key: "metadata.id", match: { value: id } }
      ],
    },
    with_payload: true,
  });
console.log('existing: ' + JSON.stringify(existing));
  if (existing.points && existing.points.length > 0) {
    return existing.points[0]?.payload?.text as string || '';
  } else {
    return '';
  }
}

export async function deleteKnowledgeBase(articleId: string): Promise<void> {
  if (!articleId) {
    throw new Error("articleId is required to delete knowledge base entries");
  }

  const vectorStore = await getQdrantVectorStore();
  await vectorStore.delete({
    filter: {
      must: [
        {
          key: "metadata.id", match: { value: articleId },
        },
      ],
    },
  });

  console.log(`✅ Deleted chunks for article ${articleId}`);
}