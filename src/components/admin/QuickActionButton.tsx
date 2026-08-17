"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";

type QuickActionButtonProps = {
  action: () => Promise<void>;
  icon: string;
  label: string;
  successMessage: string;
  errorMessage?: string;
};

/** One-click server action (approve/reject/etc.) with toast feedback — no confirm dialog. */
export function QuickActionButton({
  action,
  icon,
  label,
  successMessage,
  errorMessage = "A ação falhou. Tenta novamente.",
}: QuickActionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(successMessage);
      } catch {
        toast.error(errorMessage);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name={icon} className="text-lg" />
    </button>
  );
}
