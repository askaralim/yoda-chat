import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { config } from "../config/env.js";

export interface KnowledgeChunk {
  pageContent: string;
  metadata: Record<string, any>;
}

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: Number.parseInt(config.vector.chunkSize ?? "500", 10),
  chunkOverlap: 50,
  separators: ["\n\n", "\n", "。", "！", "？", "，", ""],
});

export async function chunkText(text: string, metadata: Record<string, any>): Promise<KnowledgeChunk[]> {
  const docs = await splitter.createDocuments([text], [metadata]);

  return docs.map((doc, index) =>
    ({
      pageContent: doc.pageContent.trim(),
      metadata: {
        ...metadata,
        ...doc.metadata,
        chunkIndex: index,
        charCount: doc.pageContent.length,
      },
    }),
  );
}