"use client";

import { useEffect } from "react";

export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch(`/api/articles/${articleId}/view`, { method: "POST" }).catch(() => {});
  }, [articleId]);

  return null;
}
