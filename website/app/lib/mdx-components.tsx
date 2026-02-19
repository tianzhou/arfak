import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-8 mb-3 text-xl font-bold tracking-tight"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-6 mb-2 text-lg font-bold"
      {...props}
    />
  ),
  p: (props) => (
    <p className="my-3 text-sm leading-7" {...props} />
  ),
  a: (props) => (
    <a
      className="border-b border-accent text-accent hover:bg-accent hover:text-white"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="my-3 ml-4 list-disc space-y-1 text-sm leading-7" {...props} />
  ),
  ol: (props) => (
    <ol
      className="my-3 ml-4 list-decimal space-y-1 text-sm leading-7"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  code: (props) => (
    <code
      className="border border-foreground/20 bg-foreground/5 px-1 py-0.5 text-xs"
      {...props}
    />
  ),
  pre: (props) => (
    <pre className="my-4 overflow-x-auto border-2 border-foreground p-4 text-xs leading-6">
      {props.children}
    </pre>
  ),
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-4 border-accent pl-4 text-sm italic"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse border-2 border-foreground text-xs" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border border-foreground bg-foreground/10 px-3 py-2 text-left font-bold" {...props} />
  ),
  td: (props) => (
    <td className="border border-foreground px-3 py-2" {...props} />
  ),
  hr: () => <hr className="my-8 border-t-2 border-foreground" />,
};
