import type { MetadataRoute } from "next";
import { getAllPosts } from "./lib/blog";

export const dynamic = "force-static";

const BASE_URL = "https://arfak.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/blog`, lastModified: new Date() },
    ...posts,
  ];
}
