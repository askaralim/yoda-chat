export interface ChatConversation {
  id?: string;
  userId: string;
  question: string;
  answer: string;
  contextIds: string[];
  chunks: ChatConversationChunk[];
  latency: number;
  createAt?: Date;
  updateAt?: Date;
}

export interface ChatConversationChunk {
  vectorId?: string;
  chunkIndex: number;
  chunkTitle: string;
  score: number;
}
