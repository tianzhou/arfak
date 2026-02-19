import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  featured: boolean;
}

const postsDirectory = path.join(process.cwd(), "content/blog");

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDirectory, filename), "utf-8");
    const { data } = matter(raw);

    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      featured: data.featured ?? false,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
