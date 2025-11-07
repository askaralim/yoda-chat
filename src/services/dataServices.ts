import { db } from "../config/db";
import { Content, Brand } from "../types/dbContent";

export async function getAllArticles() {
  const [contents] = await db.query("SELECT id, title, description FROM content where id = 4494881226746106");
  // const [brands] = await db.query("SELECT id, name AS title, description, company FROM brand");
  // const [items] = await db.query("SELECT id, name AS title, description FROM item");

  // return [...(contents as any[]), ...(brands as any[]), ...(items as any[])];
  return [...(contents as any[])];
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

