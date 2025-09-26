export const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    return (
      text
        // Headers (h1-h6)
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
        )
        .replace(
          /^#### (.*$)/gim,
          '<h4 class="text-base font-bold mt-3 mb-2">$1</h4>'
        )
        .replace(
          /^##### (.*$)/gim,
          '<h5 class="text-sm font-bold mt-3 mb-2">$1</h5>'
        )
        .replace(
          /^###### (.*$)/gim,
          '<h6 class="text-xs font-bold mt-3 mb-2">$1</h6>'
        )
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic text
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Code blocks
        .replace(
          /```([\s\S]*?)```/g,
          '<pre class="bg-gray-700 p-2 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>'
        )
        // Inline code
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>'
        )
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Line breaks
        .replace(/\n/g, "<br/>")
    );
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      className="prose prose-invert max-w-none"
    />
  );
};
