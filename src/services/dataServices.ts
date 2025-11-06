import { db } from "../config/db";

export async function getAllArticles() {
  const [contents] = await db.query("SELECT id, title, description FROM content where id = 4494881226746105");
  // const [brands] = await db.query("SELECT id, name AS title, description, company FROM brand");
  // const [items] = await db.query("SELECT id, name AS title, description FROM item");

  // return [...(contents as any[]), ...(brands as any[]), ...(items as any[])];
  return [...(contents as any[])];
}