import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "./env"

export const embeddingClient = new OpenAIEmbeddings({
    model: config.embedding.model!,
    apiKey: config.openai.apiKey,
    configuration: { baseURL: config.openai.baseURL },
});