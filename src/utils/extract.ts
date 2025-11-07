import * as cheerio from "cheerio";

export function extractTextFromHTML(text: string): string {
  const $ = cheerio.load(text);

  // remove script & style
  $("script, style").remove();
  
  // remove h1 ~ h6
  // $("h1, h2, h3, h4, h5, h6").remove();

  // extract pure text
  const result = $("body").text();

  // cleanup excessive whitespace
  return result.replace(/\s+/g, " ").trim();
}