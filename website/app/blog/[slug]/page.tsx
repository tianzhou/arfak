import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { Navbar } from "../../components/navbar";
import { MacWindow } from "../../components/mac-window";
import { Footer } from "../../components/footer";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "../../lib/blog";
import { mdxComponents } from "../../lib/mdx-components";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta } = getPostBySlug(slug);
  return {
    title: `${meta.title} - Arfak`,
    description: meta.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const related = getRelatedPosts(post.meta);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <a
          href="/blog"
          className="text-sm border-b border-foreground hover:bg-foreground hover:text-background"
        >
          &larr; Back to Blog
        </a>

        <div className="mt-8">
          <MacWindow title={post.meta.title}>
            <article className="px-8 py-8">
              <header className="mb-6">
                <div className="flex items-center gap-2">
                  <time className="text-xs">{post.meta.date}</time>
                  <span className="border border-foreground px-1.5 py-0.5 text-xs font-medium">{post.meta.category}</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                  {post.meta.title}
                </h1>
                <p className="mt-2 text-sm leading-6">
                  {post.meta.description}
                </p>
              </header>

              <hr className="border-t-2 border-foreground" />

              <div className="mt-6">
                <MDXRemote
                  source={post.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        [
                          rehypePrettyCode,
                          {
                            theme: {
                              light: "github-light",
                              dark: "github-dark",
                            },
                          },
                        ],
                      ],
                    },
                  }}
                />
              </div>
            </article>
          </MacWindow>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold tracking-tight">Related Posts</h2>
            <div className="mt-4 divide-y-2 divide-foreground border-y-2 border-foreground bg-background">
              {related.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} className="flex items-baseline gap-4 px-4 py-3 hover:bg-foreground/5">
                  <span className="shrink-0 border border-foreground px-1.5 py-0.5 text-xs font-medium">{p.category}</span>
                  <h3 className="text-sm font-bold">{p.title}</h3>
                  <time className="ml-auto shrink-0 text-xs">{p.date}</time>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
