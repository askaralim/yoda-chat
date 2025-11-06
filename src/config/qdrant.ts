import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "./env.js";

export const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
  apiKey: 'changeme123'
});