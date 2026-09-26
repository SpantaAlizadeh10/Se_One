import type { AdminBlogPost, AdminStudent, AdminTeacher } from "@/lib/api/admin";
import type { AdminStudent as MockStudent } from "@/lib/admin-data";
import type { TeacherProfile } from "@/lib/teachers-directory";

export type StudentRow = MockStudent & { status: "active" | "suspended" | "banned" };

export function adminStudentToRow(s: AdminStudent): StudentRow {
  const joined = s.joinedAt?.includes("T") ? s.joinedAt.split("T")[0] : s.joinedAt;
  return {
    id: s.id,
    name: s.fullName,
    email: s.email,
    avatar: s.avatarUrl || "https://i.pravatar.cc/64?img=1",
    joinedDate: joined || "",
    coursesEnrolled: s.coursesEnrolled,
    status: s.status,
  };
}

export type TeacherRow = TeacherProfile & { status: "active" | "pending" | "suspended" };

export function adminTeacherToRow(t: AdminTeacher): TeacherRow {
  return {
    id: t.id,
    name: t.fullName,
    avatar: t.avatarUrl || "/images/Women teacher1.jpeg",
    teachingLanguage: t.teachingLanguage,
    subject: t.subject,
    level: t.level,
    rating: t.rating,
    bio: t.bio,
    slots: [],
    status: t.status,
  };
}

export type BlogPostRow = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  status: "published" | "draft";
  publishedAt: string;
  readTime: string;
  image: string;
  views: number;
};

export function adminBlogToRow(p: AdminBlogPost): BlogPostRow {
  const published = p.publishedAt?.includes("T") ? p.publishedAt.split("T")[0] : p.publishedAt;
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    category: p.category,
    status: p.status,
    publishedAt: published || "",
    readTime: p.readTimeMinutes ? `${p.readTimeMinutes} min` : "5 min",
    image: p.imageUrl || "/images/Study4.jpeg",
    views: p.views,
  };
}

export function blogRowToApiBody(row: Omit<BlogPostRow, "id" | "views">) {
  const minutes = parseInt(row.readTime, 10) || 5;
  return {
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    category: row.category,
    status: row.status,
    readTimeMinutes: minutes,
    imageUrl: row.image,
    publishedAt: row.publishedAt,
  };
}
