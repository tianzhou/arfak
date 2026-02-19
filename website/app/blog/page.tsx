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
            <MacWindow title="Featured">
              <div className="px-8 py-8">
                <time className="text-xs">{featured.date}</time>
                <h2 className="mt-1 text-2xl font-bold">{featured.title}</h2>
                <p className="mt-3 text-sm leading-6">
                  {featured.description}
                </p>
              </div>
            </MacWindow>
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {rest.map((post) => (
              <div
                key={post.slug}
                className="border-2 border-foreground p-5 shadow-[2px_2px_0_0_var(--foreground)]"
              >
                <time className="text-xs">{post.date}</time>
                <h3 className="mt-1 text-base font-bold">{post.title}</h3>
                <p className="mt-2 text-sm leading-6">{post.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
