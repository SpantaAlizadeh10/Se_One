import Parser from "rss-parser";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const parser = new Parser();
const FEED_URL = "https://cambridgeblog.org/feed/";

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function imageFromHtml(value = "") {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? "";
}

export async function GET() {
  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "SE ONE Blog Reader/1.0" },
      next: { revalidate },
    });

    if (!response.ok) {
      return NextResponse.json(
        { posts: [], source: "cambridge" },
        { status: 502 },
      );
    }

    const feed = await parser.parseString(await response.text());
    const posts = feed.items.slice(0, 12).map((item, index) => ({
      id: `cambridge-${item.guid ?? item.link ?? index}`,
      title: item.title?.trim() ?? "",
      excerpt: stripHtml(
        item.contentSnippet || item.content || item.summary || "",
      ).slice(0, 240),
      author:
        item.creator || item["dc:creator"] || "Cambridge University Press",
      date: item.isoDate || item.pubDate || "",
      readTime: "",
      category: item.categories?.[0] || "Academic perspectives",
      image:
        item.enclosure?.url ||
        imageFromHtml(item.content || item.summary || "") ||
        "/images/Study4.jpeg",
      sourceUrl: item.link || "https://cambridgeblog.org/archive/",
      source: "cambridge",
    }));

    return NextResponse.json({ posts: posts.filter((post) => post.title) });
  } catch {
    return NextResponse.json(
      { posts: [], source: "cambridge" },
      { status: 502 },
    );
  }
}
