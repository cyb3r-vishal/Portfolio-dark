// Simple markdown-like text processor for blog content
export function processMarkdown(content: string): string {
  if (!content) return '';

  let processed = content;

  // Headers
  processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>');

  // Bold and italic
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Code blocks with language and copy button
  processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? lang : 'text';
    const trimmedCode = code.trim();
    const escapedCode = trimmedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Create a unique ID for this code block
    const codeId = `code-block-${Math.random().toString(36).substring(2, 9)}`;
    
    return `
      <div class="relative group code-block-container">
        <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded text-xs font-medium copy-code-button"
            data-code-id="${codeId}"
          >
            Copy
          </button>
        </div>
        <div class="flex items-center justify-between bg-muted/50 px-4 py-1 text-xs font-mono border-b border-border/30 rounded-t-md">
          <span>${language}</span>
        </div>
        <pre class="bg-muted p-4 rounded-b-md my-0 overflow-x-auto"><code id="${codeId}" class="font-mono text-sm">${escapedCode}</code></pre>
      </div>
      <script>
        (function() {
          // Use a self-executing function to create a scope
          const button = document.querySelector('[data-code-id="${codeId}"]');
          if (button) {
            button.addEventListener('click', function() {
              const codeElement = document.getElementById('${codeId}');
              if (codeElement) {
                navigator.clipboard.writeText(codeElement.innerText);
                this.innerText = 'Copied!';
                setTimeout(() => { this.innerText = 'Copy'; }, 2000);
              }
            });
          }
        })();
      </script>
    `;
  });
  
  // Inline code
  processed = processed.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // Images with caption
  processed = processed.replace(/!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?/g, (match, alt, src, caption) => {
    return `
      <figure class="my-6">
        <img 
          src="${src}" 
          alt="${alt || ''}" 
          class="rounded-lg shadow-md max-w-full mx-auto"
          loading="lazy"
        />
        ${caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-2">${caption}</figcaption>` : ''}
      </figure>
    `;
  });

  // Links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Line breaks
  processed = processed.replace(/\n\n/g, '</p><p class="mb-4">');
  processed = processed.replace(/\n/g, '<br>');

  // Wrap in paragraph tags
  processed = '<p class="mb-4">' + processed + '</p>';

  // Clean up empty paragraphs
  processed = processed.replace(/<p class="mb-4"><\/p>/g, '');

  return processed;
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