import { Navbar } from "../components/navbar";
import { MacWindow } from "../components/mac-window";
import { Footer } from "../components/footer";
import { getAllPosts } from "../lib/blog";

export const metadata = {
  title: "Blog - Arfak",
  description: "News, guides, and updates from the Arfak project.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p !== featured);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>

        {featured && (
          <div className="mt-10">
            <a href={`/blog/${featured.slug}`}>
              <MacWindow title="Featured">
                <div className="px-8 py-8">
                  <div className="flex items-center gap-2">
                    <time className="text-xs">{featured.date}</time>
                    <span className="border border-foreground px-1.5 py-0.5 text-xs font-medium">{featured.category}</span>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold">{featured.title}</h2>
                  <p className="mt-3 text-sm leading-6">
                    {featured.description}
                  </p>
                </div>
              </MacWindow>
            </a>
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-10 divide-y-2 divide-foreground border-y-2 border-foreground bg-background">
            {rest.map((post) => (
              <a key={post.slug} href={`/blog/${post.slug}`} className="flex items-baseline gap-4 px-4 py-3 hover:bg-foreground/5">
                <span className="shrink-0 border border-foreground px-1.5 py-0.5 text-xs font-medium">{post.category}</span>
                <h3 className="text-sm font-bold">{post.title}</h3>
                <time className="ml-auto shrink-0 text-xs">{post.date}</time>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
