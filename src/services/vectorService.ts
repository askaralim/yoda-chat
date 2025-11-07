// Store/retrieve vectors from Qdrant

import { extractTextFromHTML } from "../utils/extract.js";
import { chunkText } from "./chunkingService.js";
import { embeddingClient } from "../config/embed";
import { getQdrantVectorStore, qdrantClient, qdrantCollectionName } from "../config/qdrant.js";

export interface RetrievedChunk {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export async function findSimilarChunks(query: string, topK = 3): Promise<RetrievedChunk[]> {
  const vectorStore = await getQdrantVectorStore();
  const vector = await embeddingClient.embedQuery(query);

  const results = await vectorStore.similaritySearchVectorWithScore(vector, topK);

  return results.map(([doc, score]) => ({
    content: doc.pageContent,
    metadata: doc.metadata ?? {},
    score,
  }));
}

export async function getContextFromChunks(query: string, topK = 3): Promise<string> {
  const chunks = await findSimilarChunks(query, topK);
  return chunks.map((chunk) => chunk.content).join("\n\n");
}

export async function buildKnowledgeBase(articles: Array<Record<string, any>>): Promise<void> {
  if (!Array.isArray(articles) || articles.length === 0) {
    console.warn("No articles provided for knowledge base ingestion");
    return;
  }

  const vectorStore = await getQdrantVectorStore();

  for (const article of articles) {
    if (!article?.description) {
      continue;
    }

    const text = extractTextFromHTML(article.description);
    if (!text?.trim()) {
      continue;
    }

    const baseMetadata = {
      articleId: String(article.id ?? ""),
      title: article.title || article.name || "",
      source: article.source || "mysql",
      ingestedAt: new Date().toISOString(),
    } satisfies Record<string, any>;

    const docs = await chunkText(text, baseMetadata);

    if (docs.length === 0) {
      continue;
    }

    await vectorStore.addDocuments(docs);
    console.log(`[OK] Uploaded ${baseMetadata.title || baseMetadata.articleId} to Qdrant`);
  }

  console.log(`[OK] Ingestion finished. Processed ${articles.length} articles.`);
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

export async function deleteKnowledgeBase(articleId: string): Promise<void> {
  if (!articleId) {
    throw new Error("articleId is required to delete knowledge base entries");
  }

  await qdrantClient.delete(qdrantCollectionName, {
    filter: {
      must: [
        {
          key: "metadata.articleId",
          match: { value: String(articleId) },
        },
      ],
    },
  });

  console.log(`✅ Deleted chunks for article ${articleId}`);
}