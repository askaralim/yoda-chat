// Split long text into chunks

export function chunkText(text: string, maxLen = 500): string[] {
  const sentences = text.match(/[^。！？]*[。！？]/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      chunks.push(current);
      current = s;
    } else {
      current += s;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}
