export interface Knowledge {
  id: string;
  title: string;
  originalContent: string;
  category: string;
  source: string;
  totalChunks: number;
  metadata: {
    [key: string]: any;
  };
  createAt: Date;
  updateAt: Date;
}

export interface KnowledgeChunk {
  id: string;
  knowledgeId: string;
  chunkIndex: number;
  chunkText: string;
  sectionTitle: string;
  vectorId: string;
  createAt: Date;
  updateAt: Date;
}