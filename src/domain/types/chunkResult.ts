export interface ChunkResult {
  id: string;
  score: number;
  payload: {
    articleId: string;
    chunkIndex: number;
    text: string;
  };
}
