// Create embedding from text

import { config } from '../config/env.js';
import { openaiClient } from '../config/openai.js';

// export async function getEmbedding(text: string): Promise<number[]> {
//   try {
//     const response = await openaiClient.embeddings.create({
//       model: config.embedding.model!,
//       input: text,
//     });
//     const embedding = response.data?.[0]?.embedding;
//     if (!embedding) {
//       throw new Error('Failed to generate embedding');
//     }
//     return embedding;
//   } catch (error) {
//     console.error('Embedding generation failed:', error);
//     throw new Error(`Failed to generate embedding: ${error}`);
//   }
// }

// export async function getBatchEmbedding(texts: string[]): Promise<Array<number[]>> {
//   try {
//     const response = await openaiClient.embeddings.create({
//       model: config.embedding.model!,
//       input: texts,
//     });
//     return response.data?.map((d: any) => d.embedding) as Array<number[]>;
//   } catch (error) {
//     console.error('Batch embedding generation failed:', error);
//     throw new Error(`Failed to generate batch embedding: ${error as string}`);
//   }
// }
