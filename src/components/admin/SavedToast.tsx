"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Mounted once in the admin layout. Create/update actions redirect back
 * with `?saved=1` on success; this fires the confirmation toast and then
 * strips the param so refreshing/navigating back doesn't re-trigger it.
 */
export function SavedToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved");

  useEffect(() => {
    if (!saved) return;
    toast.success("Guardado com sucesso.");
    const params = new URLSearchParams(searchParams);
    params.delete("saved");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  return null;
}
