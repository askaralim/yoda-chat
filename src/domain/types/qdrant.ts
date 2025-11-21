export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    source: string;
    text: string;
  };
}

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload: {
    source: string;
    text: string;
  };
}
