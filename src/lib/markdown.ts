// Simple markdown-like text processor for blog content
export function processMarkdown(content: string): string {
  if (!content) return '';

  // 1) Extract fenced code blocks first and replace them with placeholders
  const codeBlocks: string[] = [];
  let text = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? String(lang) : 'text';
    const trimmedCode = String(code || '').trim();
    const escapedCode = trimmedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Create a unique ID for this code block
    const codeId = `code-block-${Math.random().toString(36).substring(2, 9)}`;

    const html = `
      <div class="relative group code-block-container">
        <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded text-xs font-medium copy-code-button"
            data-code-id="${codeId}"
            aria-label="Copy code to clipboard"
          >
            Copy
          </button>
        </div>
        <div class="flex items-center justify-between bg-muted/50 px-4 py-1 text-xs font-mono border-b border-border/30 rounded-t-md">
          <span>${language}</span>
        </div>
        <pre class="bg-muted p-4 rounded-b-md my-0 overflow-x-auto"><code id="${codeId}" class="font-mono text-sm">${escapedCode}</code></pre>
      </div>
    `;

    const index = codeBlocks.push(html) - 1;
    return `__CODE_BLOCK_${index}__`;
  });

  // 2) Apply inline markdown transformations on the remaining text (placeholders are preserved)
  // Headers
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1<\/h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-6">$1<\/h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1<\/h1>');

  // Bold and italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1<\/strong>');
  text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1<\/em>');

  // Inline code (not fenced)
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1<\/code>');

  // Images with caption
  text = text.replace(/!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?/g, (match, alt, src, caption) => {
    const a = alt ? String(alt) : '';
    const s = src ? String(src) : '';
    const c = caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-2">${caption}<\/figcaption>` : '';
    return `
      <figure class="my-6">
        <img 
          src="${s}" 
          alt="${a}" 
          class="rounded-lg shadow-md max-w-full mx-auto"
          loading="lazy"
        />
        ${c}
      </figure>
    `;
  });

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1<\/a>');

  // 3) Paragraphs and line breaks: split by blank lines and only convert single newlines within non-code parts
  const parts = text.split(/\r?\n\r?\n+/);
  const htmlParts = parts.map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    // If this part is exactly a code block placeholder, keep as-is
    if (/^__CODE_BLOCK_\d+__$/.test(trimmed)) {
      return trimmed;
    }
    // Convert single newlines to <br> inside normal paragraphs
    const withBr = trimmed.replace(/\r?\n/g, '<br>');
    return `<p class="mb-4">${withBr}<\/p>`;
  });

  let html = htmlParts.join('');

  // 4) Replace placeholders with the actual code block HTML
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[Number(idx)] || '');

  // 5) Clean empty paragraphs
  html = html.replace(/<p class="mb-4"><\/p>/g, '');

  return html;
}

// Extract plain text from markdown for excerpts
export function extractPlainText(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');
  
  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold/italic
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  
  // Remove links
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Clean up whitespace
  text = text.replace(/\n+/g, ' ').trim();
  
  return text;
}