interface PlanDisplayProps {
  planMd: string;
}

export function PlanDisplay({ planMd }: PlanDisplayProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Battle plan
      </h2>
      <div className="mt-4 rounded-lg border border-border bg-card p-6 ">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownContent content={planMd} />
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
            <li key={i} className="text-foreground">
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
        <h4 key={key++} className="mt-3 text-sm font-semibold text-foreground">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line.trim()) {
      flushList();
      elements.push(
        <p key={key++} className="text-foreground">
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
