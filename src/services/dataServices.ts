import { db } from "../config/db.js";
import { ChatConversation } from "../types/chatConversations.js";
import { Content, Brand } from "../types/dbContent.js";

export async function getAllArticles() {
  const [contents] = await db.query("SELECT id, title, description FROM content where deleted = 0");
  const [brands] = await db.query("SELECT id, name AS title, description, company FROM brand where deleted = 0");
  // const [items] = await db.query("SELECT id, name AS title, description FROM item");

  // return [...(contents as any[]), ...(brands as any[]), ...(items as any[])];
  return [...(contents as Content[]), ...(brands as Brand[])];
}

export async function getContentById(id: string): Promise<Content> {
  const [content] = await db.query("SELECT id, title, description FROM content where id = ?", [id]);
  return content as unknown as Content;
}

export async function getAllContents(): Promise<Content[]> {
  const [contents] = await db.query("SELECT id, title, description FROM content where deleted = 0");
  return contents as unknown as Content[];
}

export async function getBrandById(id: string): Promise<Brand> {
  const [brand] = await db.query("SELECT id, name, description FROM brand where id = ?", [id]);
  return brand as unknown as Brand;
}

export async function getAllBrands(): Promise<Brand[]> {
  const [brands] = await db.query("SELECT id, name, description FROM brand where deleted = 0");
  return brands as unknown as Brand[];
}

export async function insertChatConversation(conversation: ChatConversation): Promise<ChatConversation> {
  const contextIdsJson = JSON.stringify(conversation.contextIds || []);
  const chunksJson = JSON.stringify(conversation.chunks || []);

  const [result] = await db.query("INSERT INTO chat_conversations (user_id, question, answer, context_ids, chunks, latency) VALUES (?, ?, ?, ?, ?, ?)", [conversation.userId, conversation.question, conversation.answer, contextIdsJson, chunksJson, conversation.latency]);
  return result as unknown as ChatConversation;
}
