// Create embedding from text

import { config } from "../config/env";
import { openaiClient } from "../config/openai";

export async function getEmbedding(text: string): Promise<number[] | undefined> {
  try {
    const response = await openaiClient.embeddings.create({
      model: config.gpt.embeddingModel!,
      input: text,
    });
    const embedding = response.data?.[0]?.embedding;
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }
    return embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}