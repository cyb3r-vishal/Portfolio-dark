import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ImageUploader from './ImageUploader';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  Code, FileCode, Link, Image as ImageIcon, 
  List, ListOrdered, Quote, HelpCircle
} from 'lucide-react';

interface AdvancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function AdvancedEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...", 
  minHeight = "300px" 
}: AdvancedEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Save selection when opening dialogs
  const saveSelection = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
      setLinkText(value.substring(textareaRef.current.selectionStart, textareaRef.current.selectionEnd));
    }
  };

  // Insert text at cursor position
  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + before.length,
          end + before.length
        );
      }
    }, 0);
  };

  // Insert text at saved selection
  const insertAtSavedSelection = (text: string) => {
    if (!textareaRef.current) return;
    
    const newText = value.substring(0, selectionStart) + text + value.substring(selectionEnd);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = selectionStart + text.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Handle image insertion
  const handleImageInsert = () => {
    if (!imageUrl.trim()) return;
    
    let markdown = `![${imageAlt}](${imageUrl})`;
    if (imageCaption) {
      markdown += `{${imageCaption}}`;
    }
    
    insertAtSavedSelection(markdown);
    setIsImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
  };

  // Handle link insertion
  const handleLinkInsert = () => {
    if (!linkUrl.trim()) return;
    
    const text = linkText.trim() || 'link text';
    const markdown = `[${text}](${linkUrl})`;
    
    insertAtSavedSelection(markdown);
    setIsLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Toolbar button actions
  const actions = {
    bold: () => insertText('**', '**'),
    italic: () => insertText('*', '*'),
    h1: () => insertText('# '),
    h2: () => insertText('## '),
    h3: () => insertText('### '),
    code: () => insertText('`', '`'),
    codeBlock: () => insertText('```\n', '\n```'),
    link: () => {
      saveSelection();
      setIsLinkDialogOpen(true);
    },
    image: () => {
      saveSelection();
      setIsImageDialogOpen(true);
    },
    bulletList: () => insertText('- '),
    numberedList: () => insertText('1. '),
    quote: () => insertText('> '),
    help: () => setIsHelpDialogOpen(true)
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 p-1 bg-muted/30 rounded-md border border-border/50">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.bold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.italic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1"></div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.h1}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.h2}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.h3}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1"></div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.bulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.numberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.quote}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1"></div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.code}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.codeBlock}
          title="Code Block"
        >
          <FileCode className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border/50 mx-1"></div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.link}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <ImageUploader onImageUrl={(url) => {
          saveSelection();
          setImageUrl(url);
          setIsImageDialogOpen(true);
        }} />
        <div className="flex-1"></div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={actions.help}
          title="Markdown Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono text-sm resize-y"
        style={{ minHeight }}
        autoComplete="off"
      />

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {imageUrl && (
              <div className="flex justify-center mb-4 border rounded p-2">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-h-48 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x300?text=Image+Preview+Error';
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL *</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt Text</label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption (optional)</label>
              <Input
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Image caption"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageInsert} disabled={!imageUrl.trim()}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL *</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link Text</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkInsert} disabled={!linkUrl.trim()}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Markdown Formatting Guide</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-base font-semibold mb-2">Basic Formatting</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">**Bold Text**</code>
                  </div>
                  <div className="p-2">
                    <strong>Bold Text</strong>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">*Italic Text*</code>
                  </div>
                  <div className="p-2">
                    <em>Italic Text</em>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Headings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs"># Heading 1</code>
                  </div>
                  <div className="p-2">
                    <span className="text-xl font-bold">Heading 1</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">## Heading 2</code>
                  </div>
                  <div className="p-2">
                    <span className="text-lg font-bold">Heading 2</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">### Heading 3</code>
                  </div>
                  <div className="p-2">
                    <span className="text-base font-bold">Heading 3</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Lists</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">- Item 1<br/>- Item 2<br/>- Item 3</code>
                  </div>
                  <div className="p-2">
                    <ul className="list-disc list-inside">
                      <li>Item 1</li>
                      <li>Item 2</li>
                      <li>Item 3</li>
                    </ul>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">1. First item<br/>2. Second item<br/>3. Third item</code>
                  </div>
                  <div className="p-2">
                    <ol className="list-decimal list-inside">
                      <li>First item</li>
                      <li>Second item</li>
                      <li>Third item</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Code</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">`inline code`</code>
                  </div>
                  <div className="p-2">
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">inline code</code>
                  </div>
                  <div className="bg-muted/30 p-2 rounded whitespace-pre">
                    <code className="text-xs">```javascript
const hello = "world";
console.log(hello);
```</code>
                  </div>
                  <div className="p-2">
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      const hello = "world";<br/>
                      console.log(hello);
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Links & Images</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">[Link Text](https://example.com)</code>
                  </div>
                  <div className="p-2">
                    <a href="#" className="text-primary hover:underline">Link Text</a>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">![Alt text](https://example.com/image.jpg)</code>
                  </div>
                  <div className="p-2">
                    <span className="text-xs">Image with alt text</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">![Alt text](https://example.com/image.jpg)&#123;Caption text&#125;</code>
                  </div>
                  <div className="p-2">
                    <span className="text-xs">Image with caption</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Blockquotes</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/30 p-2 rounded">
                    <code className="text-xs">{'>'} This is a blockquote</code>
                  </div>
                  <div className="p-2">
                    <blockquote className="border-l-4 border-primary pl-4 italic">
                      This is a blockquote
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}