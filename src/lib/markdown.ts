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

  // Code blocks
  processed = processed.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-md my-4 overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>');
  
  // Inline code
  processed = processed.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');

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