import { apiFetch } from "./client";

export type BlogPost = {
  id: string | number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  sourceUrl?: string;
  source?: "cambridge";
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return typeof result === "string"
    ? result
    : result == null
      ? ""
      : String(result);
}

function unwrap(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "posts",
    "Data",
    "Items",
    "Posts",
  );
  return Array.isArray(nested) ? nested : [];
}

function normalizePost(raw: unknown, index: number): BlogPost | null {
  const record = (raw ?? {}) as ApiRecord;
  const id =
    value(record, "id", "Id", "postId", "PostId") ?? `api-post-${index}`;
  const title = text(record, "title", "Title", "name", "Name");
  if (!title) return null;

  return {
    id: typeof id === "number" ? id : String(id),
    title,
    excerpt: text(
      record,
      "excerpt",
      "Excerpt",
      "summary",
      "Summary",
      "description",
      "Description",
    ),
    author: text(record, "author", "Author", "authorName", "AuthorName"),
    date: text(
      record,
      "date",
      "Date",
      "publishedAt",
      "PublishedAt",
      "createdAt",
      "CreatedAt",
    ),
    readTime: text(
      record,
      "readTime",
      "ReadTime",
      "readingTime",
      "ReadingTime",
    ),
    category: text(
      record,
      "category",
      "Category",
      "categoryName",
      "CategoryName",
    ),
    image:
      text(
        record,
        "image",
        "Image",
        "imageUrl",
        "ImageUrl",
        "coverImage",
        "CoverImage",
        "coverImageUrl",
        "CoverImageUrl",
      ) || "/images/Study4.jpeg",
    sourceUrl:
      text(record, "sourceUrl", "SourceUrl", "url", "Url", "link", "Link") ||
      undefined,
    source:
      record.source === "cambridge" || record.Source === "cambridge"
        ? "cambridge"
        : undefined,
  };
}

export async function getBlogPosts(lang: string): Promise<BlogPost[]> {
  const response = await apiFetch<unknown>(
    `/api/blog?lang=${encodeURIComponent(lang)}`,
    { cache: "no-store" },
  );
  return unwrap(response)
    .map(normalizePost)
    .filter((post): post is BlogPost => post !== null);
}

export async function getCambridgeBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch("/api/blog/cambridge", { cache: "no-store" });
  if (!response.ok) throw new Error("Cambridge Blog request failed");
  const payload = (await response.json()) as { posts?: unknown };
  return Array.isArray(payload.posts)
    ? payload.posts
        .map(normalizePost)
        .filter((post): post is BlogPost => post !== null)
    : [];
}
