import BlogPostDetail from "@/components/marketing/blog/BlogPostDetail";

export default function BlogPostPage({
  params,
}: {
  params: { postId: string };
}) {
  return <BlogPostDetail postId={params.postId} />;
}
