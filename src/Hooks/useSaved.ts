import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/useAuth";

function readIds(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userKey = String(user?._id || user?.id || "guest");
  const storageKey = `saved-posts:${userKey}`;

  const idsQuery = useQuery({
    queryKey: ["savedIds", userKey],
    queryFn: () => readIds(storageKey),
    staleTime: Infinity,
  });

  const savedIds = idsQuery.data || [];

  function isSavedNow(postId: string) {
    return readIds(storageKey).includes(postId);
  }

  function setSaved(postId: string, saved: boolean) {
    const current = readIds(storageKey);
    const next = saved
      ? Array.from(new Set([...current, postId]))
      : current.filter((id) => id !== postId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      return;
    }
    queryClient.setQueryData(["savedIds", userKey], next);
  }

  return {
    savedIds,
    isSaved: (postId: string) => savedIds.includes(postId),
    isSavedNow,
    setSaved,
  };
}
