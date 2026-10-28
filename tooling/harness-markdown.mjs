export function markdownLinks(content) {
  // Examples describe contracts rather than files in the current checkout.
  const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  const inline = [...prose.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)]
    .map(match => match[1].replace(/^<|>$/g, ''));
  const references = [...prose.matchAll(/^ {0,3}\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm)]
    .map(match => match[1].replace(/^<|>$/g, ''));
  return [...inline, ...references];
}
