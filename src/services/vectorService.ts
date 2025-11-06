// Store/retrieve vectors from Qdrant

import { qdrantClient } from "../config/qdrant";
import { getEmbedding } from "../utils/embedding";
import { chunkText } from "../utils/chunkText";
import { extractTextFromHTML } from "../utils/extract";
import { config } from "../config/env";

export async function buildKnowledgeBase(articles: any[]) {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === "knowledge");

    if (!exists) {
        await qdrantClient.createCollection("knowledge", {
            vectors: { size: 1536, distance: "Cosine" },
        });
    }

    const points: any[] = [];
    let chunkCounter = 0; // Global counter for unique numeric IDs

    for (const article of articles) {
        const text = extractTextFromHTML(article.description);

        const chunks = chunkText(text, parseInt(config.gpt.chunkSize));

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk) {
                const embedding = await getEmbedding(chunk);

                points.push({
                    id: chunkCounter++,
                    vector: embedding,
                    payload: {
                        articleId: article.id, // Store article ID in payload
                        chunkIndex: i, // Store chunk index in payload
                        source: article.name || article.title,
                        text: chunk,
                    },
                });
            }
        }
    }
    await qdrantClient.upsert("knowledge", { points });
    console.log("✅ Knowledge base built successfully");
}