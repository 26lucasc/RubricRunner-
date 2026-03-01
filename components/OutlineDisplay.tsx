interface OutlineDisplayProps {
  outlineMd: string;
}

export function OutlineDisplay({ outlineMd }: OutlineDisplayProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Outline
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Mirrors your rubric structure
      </p>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownContent content={outlineMd} />
        </div>
      </div>
    </section>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-6 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-700 dark:text-slate-300">
              {item}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="mt-4 text-base font-semibold text-slate-900 dark:text-white first:mt-0">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={key++} className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line.trim()) {
      flushList();
      elements.push(
        <p key={key++} className="text-slate-700 dark:text-slate-300">
          {line}
        </p>
      );
    } else {
      flushList();
    }
  }
  flushList();

  return <>{elements}</>;
}
