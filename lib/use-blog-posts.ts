"use client";

import { useEffect, useState } from "react";
import { getBlogPosts, getCambridgeBlogPosts, type BlogPost } from "./api/blog";

export function useBlogPosts(lang: string, fallback: BlogPost[]) {
  const [posts, setPosts] = useState<BlogPost[]>(fallback);

  useEffect(() => {
    let active = true;

    Promise.allSettled([getBlogPosts(lang), getCambridgeBlogPosts()])
      .then(([backendResult, cambridgeResult]) => {
        const backendPosts =
          backendResult.status === "fulfilled" ? backendResult.value : [];
        const cambridgePosts =
          cambridgeResult.status === "fulfilled" ? cambridgeResult.value : [];
        if (active && (backendPosts.length > 0 || cambridgePosts.length > 0)) {
          setPosts([...backendPosts, ...cambridgePosts]);
        }
      })
      .catch(() => {
        // Keep the local translated posts when the .NET API is unavailable.
      });

    return () => {
      active = false;
    };
  }, [lang]);

  return posts;
}
