export function markdownLinks(content) {
  // Examples describe contracts rather than files in the current checkout.
  const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  const inline = [...prose.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)]
    .map(match => match[1].replace(/^<|>$/g, ''));
  const references = [...prose.matchAll(/^ {0,3}\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm)]
    .map(match => match[1].replace(/^<|>$/g, ''));
  return [...inline, ...references];
}

export function markdownAnchors(content) {
  const counts = new Map();
  const output = new Set();
  for (const match of content.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = match[1].toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').trim().replace(/\s/g, '-');
    const count = counts.get(base) || 0;
    output.add(count ? `${base}-${count}` : base);
    counts.set(base, count + 1);
  }
  for (const match of content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) output.add(match[1]);
  return output;
}
