import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Navbar } from "../../components/navbar";
import { MacWindow } from "../../components/mac-window";
import { Footer } from "../../components/footer";
import { getAllPosts, getPostBySlug } from "../../lib/blog";
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
                <time className="text-xs">{post.meta.date}</time>
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
                    },
                  }}
                />
              </div>
            </article>
          </MacWindow>
        </div>
      </main>

      <Footer />
    </div>
  );
}
