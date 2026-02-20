import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  featured: boolean;
  category: string;
}

const postsDirectory = path.join(process.cwd(), "content/blog");

function readPost(slug: string) {
  const raw = fs.readFileSync(
    path.join(postsDirectory, `${slug}.mdx`),
    "utf-8"
  );
  const { data, content } = matter(raw);
  const meta: Post = {
    slug,
    title: data.title,
    date: data.date,
    description: data.description,
    featured: data.featured ?? false,
    category: data.category ?? "Product",
  };
  return { meta, content };
}

export function getAllPosts(): Post[] {
  const files = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files.map((f) => readPost(f.replace(/\.mdx$/, "")).meta);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string) {
  return readPost(slug);
}

export function getRelatedPosts(current: Post, limit = 3): Post[] {
  const currentTime = new Date(current.date).getTime();

  return getAllPosts()
    .filter((p) => p.slug !== current.slug && p.category === current.category)
    .sort(
      (a, b) =>
        Math.abs(new Date(a.date).getTime() - currentTime) -
        Math.abs(new Date(b.date).getTime() - currentTime)
    )
    .slice(0, limit);
}
