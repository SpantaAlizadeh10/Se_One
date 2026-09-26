"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { courseReviews } from "@/lib/course-reviews";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  listAdminBlogPosts,
  setAdminBlogPostStatus,
  updateAdminBlogPost,
} from "@/lib/api/admin";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: "published" | "draft";
  publishedAt: string;
  readTime: string;
  image: string;
  views: number;
};

export default function AdminBlogPage() {
  const { t, lang } = useLanguage();

  // Mock blog data
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "How to Master English Speaking in 30 Days",
      excerpt:
        "A comprehensive guide to improving your English speaking skills through daily practice and proven techniques.",
      content:
        "Start with a daily speaking routine. Record yourself, review your mistakes, and repeat useful phrases in real conversations.",
      author: "Sarah Johnson",
      category: "Learning Tips",
      status: "published",
      publishedAt: "2026-09-01",
      readTime: "8 min",
      image: "/images/Study4.jpeg",
      views: 1245,
    },
    {
      id: "2",
      title: "German Grammar Made Simple",
      excerpt:
        "Understanding German grammar doesn't have to be difficult. Learn the basics with our simplified approach.",
      content:
        "German grammar becomes easier when you learn sentence patterns before memorizing individual rules.",
      author: "Hans Mueller",
      category: "Grammar",
      status: "published",
      publishedAt: "2026-08-28",
      readTime: "12 min",
      image: "/images/Study4.jpeg",
      views: 892,
    },
    {
      id: "3",
      title: "IELTS Preparation Guide",
      excerpt:
        "Everything you need to know to prepare for your IELTS exam and achieve your target band score.",
      content:
        "Build a weekly study plan around the four IELTS skills and measure your progress with timed practice tests.",
      author: "Maria Garcia",
      category: "Exam Prep",
      status: "draft",
      publishedAt: "2026-09-15",
      readTime: "15 min",
      image: "/images/Study4.jpeg",
      views: 0,
    },
  ]);

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [apiMode, setApiMode] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) return;
    listAdminBlogPosts({ pageSize: 100 })
      .then((result) => {
        setPosts(
          result.items.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            category: post.category,
            status: post.status,
            publishedAt: post.publishedAt,
            readTime: `${post.readTimeMinutes || 5} min`,
            image: post.imageUrl || "/images/Study4.jpeg",
            views: post.views,
          })),
        );
        setApiMode(true);
      })
      .catch((error) =>
        setApiError(
          error instanceof Error ? error.message : "Could not load blog posts",
        ),
      );
  }, [lang]);

  const filtered = posts.filter((post) => {
    const matchesQuery =
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.author.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || post.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    if (apiMode) {
      try {
        await deleteAdminBlogPost(id);
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Could not delete blog post",
        );
        return;
      }
    }
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const toggleStatus = async (id: string) => {
    const post = posts.find((item) => item.id === id);
    if (!post) return;
    const nextStatus = post.status === "published" ? "draft" : "published";
    if (apiMode) {
      try {
        await setAdminBlogPostStatus(id, nextStatus);
      } catch (error) {
        setApiError(
          error instanceof Error
            ? error.message
            : "Could not update publication status",
        );
        return;
      }
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, status: nextStatus } : post,
      ),
    );
  };

  const addPost = async (post: Omit<BlogPost, "id" | "views">) => {
    if (apiMode) {
      try {
        const created = await createAdminBlogPost({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          category: post.category,
          status: post.status,
          publishedAt: post.publishedAt,
          readTimeMinutes: Number.parseInt(post.readTime, 10) || 5,
          imageUrl: post.image,
          lang,
        });
        setPosts((prev) => [
          { ...post, id: created.id, views: created.views },
          ...prev,
        ]);
        setShowAddModal(false);
        return;
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Could not create blog post",
        );
        return;
      }
    }
    const newPost: BlogPost = {
      ...post,
      id: `post${Date.now()}`,
      views: 0,
    };
    setPosts((prev) => [...prev, newPost]);
    setShowAddModal(false);
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    if (apiMode) {
      try {
        await updateAdminBlogPost(id, {
          ...updates,
          readTimeMinutes: updates.readTime
            ? Number.parseInt(updates.readTime, 10) || 5
            : undefined,
          imageUrl: updates.image,
          content: updates.content,
        });
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Could not update blog post",
        );
        return;
      }
    }
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updates } : post)),
    );
    setEditingPost(null);
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    const styles = {
      published: "bg-sage text-sageDeep",
      draft: "bg-[#FDEFE0] text-[#B8792E]",
    };
    const labels = {
      published: "Published",
      draft: "Draft",
    };
    return (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
  };

  return (
    <div>
      {apiError && <p className="text-danger text-[13px] mb-4">{apiError}</p>}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Total Posts</div>
          <div className="font-serif text-[22px] font-semibold">
            {stats.total}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Published</div>
          <div className="font-serif text-[22px] font-semibold text-sageDeep">
            {stats.published}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Drafts</div>
          <div className="font-serif text-[22px] font-semibold text-[#B8792E]">
            {stats.draft}
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4 shadow-card">
          <div className="text-[11px] text-muted mb-1">Total Views</div>
          <div className="font-serif text-[22px] font-semibold text-blue">
            {stats.totalViews.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 bg-white border border-line rounded-full px-4 py-2.5 shadow-card max-w-[320px]">
          <Search size={16} className="text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 min-w-0 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 border border-line rounded-full bg-white text-[13.5px] outline-none focus:border-blue"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue text-white rounded-full px-4 py-2.5 text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-cream border-b border-line">
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Title
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Author
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Category
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Status
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Views
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Published
              </th>
              <th className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr
                key={post.id}
                className="border-b border-line last:border-none hover:bg-cream/60"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue/20 to-blue/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue" />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-semibold block max-w-[200px] truncate">
                        {post.title}
                      </span>
                      <span className="text-[11px] text-muted">
                        {post.readTime} read
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {post.author}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {post.category}
                </td>
                <td className="px-5 py-3.5">{getStatusBadge(post.status)}</td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {post.views.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">
                  {post.publishedAt}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(post.id)}
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-sageDeep bg-sage hover:bg-sage/80 px-3 py-1.5 rounded-full transition-colors"
                      title={
                        post.status === "published" ? "Unpublish" : "Publish"
                      }
                    >
                      {post.status === "published" ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingPost(post)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue bg-blue/10 hover:bg-blue/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => remove(post.id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-[13.5px] text-muted"
                >
                  No blog posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Create New Blog Post
            </h3>
            <BlogPostForm
              onSubmit={addPost}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-[20px] font-semibold mb-4">
              Edit Blog Post
            </h3>
            <BlogPostForm
              post={editingPost}
              onSubmit={(updates) => updatePost(editingPost.id, updates)}
              onCancel={() => setEditingPost(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BlogPostForm({
  post,
  onSubmit,
  onCancel,
}: {
  post?: BlogPost;
  onSubmit: (post: Omit<BlogPost, "id" | "views">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          category: post.category,
          status: post.status,
          readTime: post.readTime,
          image: post.image,
        }
      : {
          title: "",
          excerpt: "",
          content: "",
          author: "",
          category: "Learning Tips",
          status: "draft" as const,
          readTime: "5 min",
          image: "/images/Study4.jpeg",
        },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      publishedAt: post?.publishedAt || new Date().toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue h-24 resize-none"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Article content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue min-h-[220px] resize-y"
            placeholder="Write the complete article content here..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            >
              <option value="Learning Tips">Learning Tips</option>
              <option value="Grammar">Grammar</option>
              <option value="Exam Prep">Exam Prep</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Read Time
            </label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) =>
                setFormData({ ...formData, readTime: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
              placeholder="e.g., 5 min"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-ink mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "published" | "draft",
                })
              }
              className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-ink mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-line rounded-xl bg-cream outline-none focus:border-blue"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-line rounded-xl text-[13.5px] font-semibold hover:bg-cream transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-blue text-white rounded-xl text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
        >
          {post ? "Save Changes" : "Publish Post"}
        </button>
      </div>
    </form>
  );
}
